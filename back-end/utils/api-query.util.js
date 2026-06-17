class ApiQuery {
  constructor(queryParams) {
    this.queryParams = queryParams;
    this.filters = {};
  }

  search(fields = []) {
    if (!this.queryParams.search) {
      return this;
    }

    this.filters.$or = fields.map((field) => ({
      [field]: {
        $regex: this.queryParams.search,
        $options: 'i',
      },
    }));

    return this;
  }

  filter(allowedFilters = []) {
    allowedFilters.forEach((field) => {
      if (this.queryParams[field] !== undefined) {
        this.filters[field] = this.queryParams[field];
      }
    });

    return this;
  }

  getFilters() {
    return this.filters;
  }

  getPagination() {
    const page = Number(this.queryParams.page) || 1;

    const limit = Number(this.queryParams.limit) || 10;

    const skip = (page - 1) * limit;

    return {
      page,
      limit,
      skip,
    };
  }

  getSort() {
    return this.queryParams.sort || '-createdAt';
  }
}

module.exports = ApiQuery;
