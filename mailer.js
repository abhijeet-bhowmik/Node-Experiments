const express = require('express');
const app = express();
const mailer = require('nodemailer');
const kue = require('kue');
const queue = kue.createQueue();
const kueUiExpress = require('kue-ui-express');
kueUiExpress(app, '/kue/', '/kue-api/');



//mail setup
var carrier = mailer.createTransport({
  service : 'gmail',
  auth : {
    user : 'abhi.bh.31296@gmail.com',
    pass : 'AbHi2726#'
  }
});
//mailing options
const mailOptions = {
  from : 'elonmusk@spacex.com',
  to  : null,
  subject : 'Test mail',
  html : '<p>Hello. This is a test mail.</p>'
};

//function that sends mail.
var mailing_func = function(){

  return new Promise(function(resolve, reject){
    carrier.sendMail(mailOptions, function(err, info){
      if(err) reject(err);
      else resolve(info);
    })
  })
}
//reciever lists
var mailing_list =  ["abhijeetbhowmik@outlook.com", "rachna281996@gmail.com", "abhi.bh.31296@gmail.com"];


//function that creates jobs and invoke sendMail function
var mailman = function(){
    for(var i = 0 ; i < mailing_list.length ; i++){
      var job = queue.create(`'email${i}'`, {
        title : "Email Sending",
        to : `"${mailing_list[i]}"`
      }).priority('high').attempts(5).save();
      job.on('complete', function(result){
        console.log(result);
      });
      queue.process(`'email${i}'`, function(job,done){
        sendMail(job.data.to, done);
      })
    }
}

//function that the job has to perform.
var sendMail = function(mail_id, done){
  console.log(mail_id);
  mailOptions.to = mail_id;
  console.log("Sending mail to" + mailOptions.to);
  mailing_func()
  .then(function(result){
    console.log(result);
    done();
  })
  .catch(function(err){
    console.log(err);
  });
};






//rest of the stuffs.
app.use('/kue-api/', kue.app);
app.use(mailman);

app.listen(3000);


