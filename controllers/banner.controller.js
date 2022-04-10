const Sequelize = require('sequelize');
const logger = require('../config/logger');
const message = require('../response_message/message');
const Banner = require('../models/banner');

/**
 * insert banner  data
 * 
 * @body {bannerImage, description, createByIp} req to add banner  data
 */
exports.addBanner = async (req, res, next) => {
    try {
        let {
            bannerImage,
            description,
            createByIp
        } = await req.body;
        if (req.file) {
            bannerImage = req.file.filename;
        }
        let insert_status = await Banner.create({
            bannerImage,
            description,
            createByIp
        })
        logger.info(`Banner data inserted: ${JSON.stringify(req.body)}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.banneradded, data: insert_status });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns all banner s data
 * 
 * @body {limit, page} req to get all data
 */

exports.getAllBanners = async (req, res, next) => {
    try {
        let { limit, page, searchQuery } = await req.body;
        let offset = (page - 1) * limit;
        let banner = [], totalcount;
        if (searchQuery) {
            banner = await Banner.findAll({
                where: {
                    [Sequelize.Op.or]: [
                        { description: { [Sequelize.Op.iLike]: '%' + searchQuery + '%' } },
                    ],
                    status: [0, 1]
                }
            });
            totalcount = banner.length;
        } else if (limit == "" && page == "") {
            banner = await Banner.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                }
            });
            totalcount = await Banner.count({
                raw: true,
                where: { status: ['0', '1'] },
            });
        }
        else {
            banner = await Banner.findAll({
                where: {
                    status: {
                        [Sequelize.Op.in]: [0, 1]
                    }
                },
                limit: limit,
                offset: offset
            });
            totalcount = await Banner.count({
                raw: true,
                where: { status: ['0', '1'] },
            });
        }

        logger.info(`Banner get data ${JSON.stringify(banner)} `);
        res.status(200)
            .json({ status: 200, data: banner, totalcount: totalcount });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * returns banner data by id
 * 
 * @param {id} req to get banner data by id
 */

exports.getBannerById = async (req, res, next) => {
    try {
        let banner = await Banner.findOne({
            where: {
                status: [0, 1],
                bannerId: req.params.id
            }
        });
        logger.info(`Banner get data by id ${req.params.id} results: ${JSON.stringify(banner)} `);
        if (banner)
            res.status(200)
                .json({ status: 200, data: banner });
        else
            res.status(200)
                .json({ status: 200, data: {}, message: message.resmessage.deletedrecord });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * updates banner  data
 * 
 * @body {bannerId, bannerImage, description, updateByIp} req to update banner  data
 */
exports.updateBanner = async (req, res, next) => {
    try {
        let {
            bannerId,
            bannerImage,
            description,
            updateByIp
        } = await req.body;
        if (req.file) {
            bannerImage = req.file.filename;
        }
        let update_status = await Banner.update({
            bannerImage,
            description,
            updateByIp
        }, {
            where: {
                bannerId: bannerId
            }
        });
        logger.info(`Banner data updated status: ${JSON.stringify(update_status)} for banner id ${bannerId}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.bannerupdated, data: {} });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * delete banner  by id
 *
 * @body {bannerId} to delete banner 
 */
exports.deleteBanner = async (req, res, next) => {
    try {
        let {
            bannerId
        } = await req.body;
        let delete_status = await Banner.update({
            status: 2
        }, {
            where: { bannerId: bannerId }
        });
        logger.info(`Banner deleted by id ${bannerId} delete status: ${delete_status}`);
        res.status(200)
            .json({ status: 200, message: message.resmessage.bannerdeleted });
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};

/**
 * change status of banner  by id
 *
 * @body {bannerId, status} to change status
 */
exports.changeStatus = async (req, res, next) => {
    try {
        let {
            bannerId,
            status
        } = await req.body;
        let change_status = await Banner.update({
            status
        }, {
            where: {
                bannerId: bannerId,
                status: [0, 1]
            }
        });
        if (change_status != 0) {
            logger.info(`Banner status changed to ${status} for banner  ${bannerId}`);
            res.status(200)
                .json({ status: 200, message: message.resmessage.bannerstatus });
        } else {
            logger.info(`Banner status for banner  ${bannerId} not changed`);
            res.status(200)
                .json({ status: 200, message: message.resmessage.deletedrecord });
        }
    } catch (err) {
        if (!err.statusCode) {
            res.status(200)
                .json({ status: 401, message: err.message, data: {} })
        }
        next(err);
    }
};