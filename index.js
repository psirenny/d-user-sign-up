var request = require('superagent');

function Component () {}

Component.prototype.create = function (model, dom) {
  if (model.get('autofocus')) this.focus();
  if (this.form) dom.addListener('submit', this.form, this.submit.bind(this));
};

Component.prototype.error = function (err) {
  this.model.del('submitting');
  this.model.set('error', err);
  this.redirect();
};

Component.prototype.focus = function () {
  if (this.username) this.username.focus();
};

Component.prototype.redirect = function () {
  var model = this.model;
  model.set('redirecting', true);
  var error = model.get('error');
  var redirect = model.get('errorRedirect') || model.get('redirect');
  if (error && redirect) return this.history.push(redirect);
  redirect = model.get('successRedirect') ||  model.get('redirect');
  if (redirect) return this.history.push(redirect);
  model.del('redirecting');
};

Component.prototype.reset = function () {
  if (this.form) this.form.reset();
};

Component.prototype.submit = function (e) {
  if (e) e.preventDefault();
  var self = this;
  var model = this.model;
  var basePath = model.get('basePath') || '';
  var data = model.get('data');
  var origin = model.get('origin') || window.location.origin;
  var path = model.get('path') || '/signup';
  var url = model.get('url') || (origin + basePath + path);

  model.del('error');
  model.set('submitting', true);
  this.emit('submitting');
  this.validate(function (err) {
    if (err) return self.error(err);
    request
      .post(url)
      .withCredentials()
      .send(data)
      .end(function (err, res) {
        var error = err || res.error;
        if (error) return self.error(error);
        self._submitted(function (err) {
          model.del('submitting');
          if (err) return self.error(err);
          self.emit('submitted');
          self.redirect();
        });
      });
  });
};

Component.prototype.validate = function (done) {
  var model = this.model;
  this._validate(done);
};

Component.prototype._submitted = function (done) {
  done();
};

Component.prototype._validate = function (done) {
  done();
};

module.exports = Component;
