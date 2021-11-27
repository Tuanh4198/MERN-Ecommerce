class ApiFeatures {
	constructor(query, queryStr) {
		this.query = query;
		this.queryStr = queryStr;
	}

	search() {
		const keyword = this.queryStr.keyword 
			? {
				name: {
					$regex: `.*${this.queryStr.keyword}.*`,
					$options: "i"
				}
			}
			: {};

		this.query = this.query.find({...keyword});
		return this;
	}

	filter() {
		const queryCopy = {...this.queryStr}
		const removeFields = ["keyword", "page", "limit"];
		//  Removing some fields category
		removeFields.forEach(key => delete queryCopy[key]);
		//  Filter for price, rating
		let queryStr = JSON.stringify(queryCopy);
		// gt: Lớn hơn | lt: nhỏ hơn
		// gte: lớn hơn hoặc bằng | lte: nhỏ hơn hoặc bằng
		queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, key => `$${key}`);
		this.query = this.query.find(JSON.parse(queryStr));
		return this;
	}

	pagination(resultPerPage) {
		const curentPage = Number(this.queryStr.page) || 1;
		const skip = resultPerPage * (curentPage - 1);
		this.query = this.query.limit(resultPerPage).skip(skip);
		return this;
	}
}

module.exports = ApiFeatures;
