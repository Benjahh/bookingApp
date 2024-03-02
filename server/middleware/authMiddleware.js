import JWT from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
  const authHeader = req?.headers?.authorization;
  console.log(req.headers);
  console.log(req.headers.authorization);
  console.log(req.body.token);

  if (!authHeader || !authHeader?.startsWith('Bearer')) {
    next('Authentication validation failed');
  }

  const token = authHeader?.split(' ')[1];

  try {
    const userToken = JWT.verify(token, process.env.JWT_SECRET_KEY);

    req.body.user = {
      userId: userToken.userId,
    };

    next();
  } catch (error) {
    console.log(error);
    next('Authentication failed');
  }
};

export default userAuth;
