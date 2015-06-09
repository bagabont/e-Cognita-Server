var crypto = require('crypto'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var User = new Schema({
    created: {type: Date, default: Date.now},
    email: {type: String, unique: true, required: true},
    pushToken: {type: String},
    hashedPassword: {type: String, required: true},
    salt: {type: String, required: true},
    firstName: {type: String},
    lastName: {type: String},
    enrollments: {type: [Schema.ObjectId]}
});

User.methods.encryptPassword = function (password) {
    return crypto.createHmac('sha256', this.salt).update(password).digest('hex');
};

User.virtual('password')
    .set(function (password) {
        this._plainPassword = password;
        this.salt = crypto.randomBytes(128).toString('base64');
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function () {
        return this._plainPassword;
    });

User.methods.checkPassword = function (password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

module.exports = mongoose.model('user', User);