module.exports.searchHelper = function(searchField, fields) {

    let orArr = [];
    let search = [];

    searchField = searchField.replace(/[\*()+?[]/g, "")
    searchField = searchField.replace("]", "");
    search[0] = searchField.trim()

    fields.forEach((element1) => {
        search.forEach((element) => {
            orArr.push({
                [element1]: { $regex: new RegExp(element, "i") }
            });
        });
    });
    return { $match: { $or: orArr } };
};