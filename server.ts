import express = require('express');
import path = require('path');
import logger = require('morgan');
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');

import { ComicsLibrary } from "./src/lib/ComicsLibrary";

var app = express();
var comicsLibrary = new ComicsLibrary();
var bodyParser = require('body-parser');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'))
});
app.get('/comic', function (req, res) {
    res.redirect('/');
});
app.get('/reader', function (req, res) {
    res.redirect('/');
});
app.get('/library', function (req, res) {
    res.redirect('/');
});
app.get('/config', function (req, res) {
    res.redirect('/');
});

app.get('/getConfig', function (req, res) {
    res.json(comicsLibrary.config);
});
app.post('/saveConfig', function (req, res) {
    comicsLibrary.saveConfig(req.body);
    res.json(comicsLibrary.config);
});
app.get('/getLibrary', function (req, res) {
    res.json(comicsLibrary.comics);
});
app.get('/reloadLibrary', function (req, res) {
    comicsLibrary.loadLibrary();
    res.json(comicsLibrary.comics);
});
app.get('/saveLibrary', function (req, res) {
    comicsLibrary.saveLibrary();
    res.json(comicsLibrary.comics);
});
app.get('/parseComics', function (req, res) {
    comicsLibrary.parseComics(res);
});
app.get('/parseIssues', function (req, res) {
    comicsLibrary.parseIssues(res);
});
app.get('/findExactMapping', function (req, res) {
    comicsLibrary.findExactMapping(res);
});
app.get('/removeDuplicateIssues', function (req, res) {
    comicsLibrary.removeDuplicateIssues();
    res.json(comicsLibrary.comics);
});
app.get('/updateLibraryInfos', function (req, res) {
    comicsLibrary.updateLibraryInfos(res);
});
app.get('/updateLibraryInfos/:comic', function (req, res) {
    comicsLibrary.comics[req.params.comic].updateInfos(comicsLibrary.config, (err)=>{res.json(comicsLibrary.comics[req.params.comic]);});
});
app.get('/updateComicVineId/:comic/:id', function (req, res) {
    var comicVineId = parseInt(req.params.id);
    var comic = comicsLibrary.comics[req.params.comic];
    if (comicVineId && comic.comicVineId !== comicVineId) {
        comic.comicVineId = comicVineId;
        comic.updateInfos(comicsLibrary.config, (err)=>{res.json(comicsLibrary.comics[req.params.comic]);});
    }
});
app.post('/updateReadingStatus', function (req, res) {
    comicsLibrary.updateReadingStatus(req.body);
    res.json(comicsLibrary.comics[req.body.folder_name]);
});
app.post('/markRead', function (req, res) {
    comicsLibrary.markRead(req.body);
    res.json(comicsLibrary.comics[req.body.folder_name]);
});
app.post('/read', function (req, res) {
    comicsLibrary.read(req.body, res);
});
app.get('/image/:comic/:issue/:image', function (req, res) {
    var image = path.resolve("./temp", req.params.comic, req.params.issue, req.params.image);
    console.log("image requested: " + image);
    res.sendFile(image);
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
