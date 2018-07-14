const express = require('express');
const app = express();
const mailer = require('nodemailer');
const kue = require('kue');
const queue = kue.createQueue();
const kueUiExpress = require('kue-ui-express');
kueUiExpress(app, '/kue/', '/kue-api/');
const cron = require('node-cron');



//mail setup
var carrier = mailer.createTransport({
  service : 'gmail',
  auth : {
    user : 'abhi.bh.31296@gmail.com',
    pass : <my password here>
  }
});
//mailing options
const mailOptions = {
  from : 'elonmusk@spacex.com',
  to  : null,
  subject : 'Test mail',
  html : '<p>Hello. This is a test mail.</p>'
};
//
// //function that sends mail.
var mailing_func = function(){

  return new Promise(function(resolve, reject){
    carrier.sendMail(mailOptions, function(err, info){
      if(err) reject(err);
      else resolve(info);
    })
  })
}
// //reciever lists
var mailing_list =  ["abhijeetbhowmik@outlook.com", "rachna281996@gmail.com", "abhi.bh.31296@gmail.com"];


//function that creates jobs and invoke sendMail function
var mailman = function(){
    for(var i = 0 ; i < mailing_list.length ; i++){
      var job = queue.create(`'email${i}'`, {
        title : "Email Sending",
        to : `"${mailing_list[i]}"`
      }).attempts(5).ttl(100000).priority('high').save();
      job.on('complete', function(result){
        console.log(result);
      });
      job.on('progress', function(progress, data){
        console.log('job #' + job.id + ' ' + progress + '% complete.');
      });
      queue.process(`'email${i}'`, function(job,done){
        job.log()
        sendMail(job.data.to, done);
      })
    }
}
//
// //function that the job has to perform.
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





//cron

var task = cron.schedule('59 8 16 28 6 *', function(){
  mailman();
  }, false
);



var func = function(){
  task.start();
}





//rest of the stuffs.
app.use('/kue-api/', kue.app);
//app.use(mailman);
app.use(func);
app.listen(3000);


