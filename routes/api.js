'use strict';
const mongoose = require('mongoose');

module.exports = function (app) {



  mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function () {
    console.log("connected to mongo db succesfully")
  });

  function getModel(collection) {
    return mongoose.model(collection, issueSchema);
  }


  const issueSchema = new mongoose.Schema({
    assigned_to: String,
    status_text: String,
    open: Boolean,
    issue_title: String,
    issue_text: String,
    created_by: String,
    created_on: Date,
    updated_on: Date



  });


  app.route('/api/issues/:project')



    .get(function (req, res) {
      let project = req.params.project;
      if (!project) {
        res.end();
        return;
      }

      let filter = req.query;

      if (filter.open) {
        filter.open = (filter.open === 'true')
      }

      let MyModel = new getModel(project);
      MyModel.find(filter, function (err, docs) {
        if (err) return console.error(err);
        res.json(docs);
      });
    })

    .post(function (req, res) {
      let project = req.params.project;
      let issue = req.body;



      if (!issue.issue_title || !issue.issue_text || !issue.created_by) {
        res.json({ error: 'required field(s) missing' });
        return;
      }
      if (!issue.assigned_to) {
        issue.assigned_to = "";
      }
      if (!issue.status_text) {
        issue.status_text = "";
      }
      issue.created_on = new Date();
      issue.updated_on = new Date();
      issue.open = true;

      let newIssue = new getModel(project)(issue);
      newIssue.save(function (err, returnedIssue) {
        if (err) return console.error(err);
        delete returnedIssue.__v;
        res.json(returnedIssue)
      });


    })

    .put(function (req, res) {

      try {
        let project = req.params.project;
        let issue = req.body;
        let selectedId = req.body._id;
        if (!issue._id) {
          res.json({ error: 'missing _id' });
          return;
        }
        if (!issue.issue_title && !issue.issue_text && !issue.created_by && !issue.assigned_to && !issue.status_text) {
          res.json({ error: 'no update field(s) sent', '_id': issue._id });
          return;
        }


        issue.updated_on = new Date();
        issue.open = (issue.open !== 'true')
        delete issue._id
        getModel(project).findByIdAndUpdate(selectedId, issue, function (err, updatedIssue) {
          if (updatedIssue) {
           
            res.json({ result: 'successfully updated', '_id': selectedId })
          } else {
           
            res.json({ error: 'could not update', '_id': selectedId })
          }
        });

       
      } catch (error) {
       
        res.json({ error: 'could not update', '_id': selectedId })
      }


    })

    .delete(function (req, res) {
      let project = req.params.project;
      let issue = req.body;


      if (!issue._id) {
        res.json({ error: 'missing _id' });
        return;
      }

      getModel(project).findByIdAndDelete(issue._id, function (err, deletedIssue) {
        if (deletedIssue) {
          res.json({ result: 'successfully deleted', '_id': issue._id })
          console.dir("Successfully deleted one document.");
        } else {
          res.json({ error: 'could not delete', '_id':issue._id })
          console.log("No documents matched the query. Deleted 0 documents.");
        }
      });
     


    });

};
