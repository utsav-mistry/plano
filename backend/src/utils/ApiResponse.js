export class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static ok(data, message = 'Success') {
    return new ApiResponse(200, data, message);
  }

  static created(data, message = 'Resource created successfully') {
    return new ApiResponse(201, data, message);
  }

  static noContent() {
    return new ApiResponse(204, null, 'No Content');
  }

  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp,
    });
  }
}
