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

  filter() {
    if (this.queryParams.brand) {
      this.filters.brand = this.queryParams.brand;
    }

    if (this.queryParams.status) {
      this.filters.status = this.queryParams.status;
    }

    if (this.queryParams.featured) {
      this.filters.featured = this.queryParams.featured === 'true';
    }

    if (this.queryParams.minPrice || this.queryParams.maxPrice) {
      this.filters.price = {};

      if (this.queryParams.minPrice) {
        this.filters.price.$gte = Number(this.queryParams.minPrice);
      }

      if (this.queryParams.maxPrice) {
        this.filters.price.$lte = Number(this.queryParams.maxPrice);
      }
    }

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
