import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import _ from 'lodash';
import { User, Image } from '../../models';
import { successResponse, errorResponse, uniqueId } from '../../helpers';
import minioClient from '../../helpers/minio';

export const allUsers = async (req, res) => {
  try {
    const page = req.params.page || 1;
    const limit = 2;
    const users = await User.findAndCountAll({
      order: [
        ['createdAt', 'DESC'],
        ['firstName', 'ASC'],
      ],
      offset: (page - 1) * limit,
      limit,
    });
    return successResponse(req, res, { users });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const register = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
    } = req.body;

    const user = await User.scope('withSecretColumns').findOne({
      where: { email },
    });
    if (user) {
      throw new Error('User already exists with same email');
    }
    const reqPass = crypto.createHash('md5').update(password).digest('hex');
    const payload = {
      email,
      firstName,
      lastName,
      password: reqPass,
    };

    const newUser = await User.create(payload);
    const token = jwt.sign(
      {
        user: {
          userId: newUser.id,
          email: newUser.email,
          createdAt: new Date(),
        },
      },
      process.env.SECRET,
    );

    return successResponse(req, res, {
      token,
      user: _.omit(newUser.get(), 'password'),
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const login = async (req, res) => {
  try {
    const user = await User.scope('withSecretColumns').findOne({
      where: { email: req.body.email },
    });
    if (!user) {
      throw new Error('Incorrect Email Id/Password');
    }
    const reqPass = crypto
      .createHash('md5')
      .update(req.body.password || '')
      .digest('hex');
    if (reqPass !== user.password) {
      throw new Error('Incorrect Email Id/Password');
    }
    const token = jwt.sign(
      {
        user: {
          userId: user.id,
          email: user.email,
          createdAt: new Date(),
        },
      },
      process.env.SECRET,
    );
    return successResponse(req, res, {
      token,
      user: _.omit(user.get(), 'password'),
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const profile = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findOne({ where: { id: userId } });
    return successResponse(req, res, { user });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const userImages = async (req, res) => {
  try {
    const { userId } = req.user;
    const images = await Image.findAll({ where: { userId } });

    return successResponse(req, res, { images });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const userImage = async (req, res) => {
  try {
    const { userId } = req.user;
    const imageId = parseInt(req.param('id'), 10) || 0;
    const image = await Image.findOne({ where: { userId, id: imageId } });

    return successResponse(req, res, { image });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const addImage = async (req, res) => {
  try {
    const { userId } = req.user;
    const imageData = (req.files || []).map(async ({ buffer }) => {
      const key = `${uniqueId(20)}.jpeg`;
      await minioClient.putObject('test', key, buffer);
      return Image.create({
        link: `${process.env.MINIO_PUBLIC_URL}/test/${key}`,
        userId,
      });
    });

    const images = await Promise.all(imageData);

    return successResponse(req, res, { images });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.scope('withSecretColumns').findOne({
      where: { id: userId },
    });

    const reqPass = crypto
      .createHash('md5')
      .update(req.body.oldPassword)
      .digest('hex');
    if (reqPass !== user.password) {
      throw new Error('Old password is incorrect');
    }

    const newPass = crypto
      .createHash('md5')
      .update(req.body.newPassword)
      .digest('hex');

    await User.update({ password: newPass }, { where: { id: user.id } });
    return successResponse(req, res, {});
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
