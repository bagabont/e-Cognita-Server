var crypto = require('crypto'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var User = new Schema({
    date_created: {type: Date},
    email: {type: String, unique: true, required: true},
    push_token: {type: String},
    hashed_password: {type: String, required: true},
    salt: {type: String, required: true},
    first_name: {type: String},
    last_name: {type: String},
    enrollments: {type: [Schema.ObjectId]}
});

User.pre('save', function (next) {
    if (!this.date_created) {
        this.date_created = Date.now;
    }
    next();
});

User.methods.encryptPassword = function (password) {
    return crypto.createHmac('sha256', this.salt).update(password).digest('hex');
};

User.virtual('password')
    .set(function (password) {
        this._plainPassword = password;
        this.salt = crypto.randomBytes(128).toString('base64');
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function () {
        return this._plainPassword;
    });

User.methods.checkPassword = function (password) {
    return this.encryptPassword(password) === this.hashed_password;
};

module.exports = mongoose.model('User', User);