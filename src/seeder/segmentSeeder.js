const segmentModel = require("../models/segment.model");
const scriptModel = require("../models/script.model");
const {ACTIVE_STATUS} = require('../../config/key');

module.exports = {
    run: () =>
        new Promise((resolve) => {
            (async() => {
                let scriptFound = await scriptModel.find();

                if (scriptFound?.length > 0) {
                    for (let a of scriptFound) {
                        let segmentName = a.e.trim().replace(/[^a-zA-Z0-9\s]/g, "").toLowerCase().replace(/\s/g, '-').replace(/\-\-+/g, '-');
                        let segmentFound = await segmentModel.findOne({ slug: segmentName, status: ACTIVE_STATUS });
                        if (!segmentFound) {
                            await segmentModel.create({
                                segmentName: a.e,
                                slug: segmentName
                            })
                        }
                    }
                }
                resolve(true);
            })();
        })
};