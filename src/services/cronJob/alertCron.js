console.log(1111)
const cron = require("node-cron");
const moment = require("moment")
const scriptHistoryModel = require("../../models/scriptHistory.model");
const scriptModel = require("../../models/script.model");
const userAlertModel = require("../../models/userAlert.model");
cron.schedule('30 10 * * *', async () => {
    console.log('Running a task daily at 12:30 AM');
// cron.schedule('*/5 * * * * *', async () => {
    try {
        let scriptList = await scriptModel.find();
        if (scriptList?.length > 0) {
            const transformedData = transformData(scriptList);
            await scriptHistoryModel.insertMany(transformedData);
            console.log("Script history inserted cron run successfully")
        }

    } catch (e) {
        console.log("cronJob error -->", e)
    }
})
//     // Your task code here
// });
const transformData = (dataArray) => {
  return dataArray.map(data => {
    //   const created_Date = new Date();
    // const createdDate = created_Date.toISOString().split('T')[0];
    const createdDate = new Date().toISOString();
    return {
      _id: `${createdDate.split('T')[0]}#${data.e}#${data.s}#${data.ix}`,
      script: {
        _id: data.id,
        s: data.s,
        ix: data.ix,
        e: data.e,
        n: data.n,
        i1: data.i1,
        i2: data.i2,
        i3: data.i3,
        i4: data.i4,
        i5: data.i5,
        i6: data.i6,
        i7: data.i7,
        i8: data.i8,
        i9: data.i9,
        i10: data.i10,
        i11: data.i11,
        i12: data.i12,
        i13: data.i13,
        i14: data.i14,
        i15: data.i15,
        i16: data.i16,
        i17: data.i17,
        i18: data.i18,
        i19: data.i19,
        i20: data.i20,
        i21: data.i21,
        iltt: data.iltt,
        si1: data.si1,
        si2: data.si2,
        si3: data.si3,
        si4: data.si4,
        si5: data.si5,
        si6: data.si6,
        si7: data.si7,
        si8: data.si8,
        si9: data.si9,
        si10: data.si10,
        si11: data.si11,
        si12: data.si12,
        si13: data.si13,
        si14: data.si14,
        si15: data.si15,
        si16: data.si16,
        si17: data.si17,
        si18: data.si18,
        si19: data.si19,
        si20: data.si20,
        si21: data.si21,
        stn: data.stn,
      },
      createdDate,
      _class: 'com.live.market.model.History',
    };
  });
};
