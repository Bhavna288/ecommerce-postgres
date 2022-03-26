function verifyToken (req, res, next) {
    // get the header value

    const bearerHader = req.headers.authorization;
    if (typeof bearerHader !== 'undefined') {
        // split the space
        const bearer = bearerHader.split(' ');

        // get token from array
        const bearerToken = bearer[1];

        // set the token
        req.token = bearerToken;

        // next middleware
        next();
    } else {
        res.status(200).send(401);
    }
}
module.exports = { verifyToken };
