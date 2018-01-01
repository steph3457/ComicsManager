import "reflect-metadata";
import * as express from 'express';
import * as path from "path";
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as  bodyParser from 'body-parser';
import * as compression from 'compression';
import { ComicsLibrary } from "./src/lib/ComicsLibrary";
import * as fs from 'fs';

var app = express();
var comicsLibrary = new ComicsLibrary(false);
var bodyParser = require('body-parser');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
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

app.get('/api/comics', function (req, res) {
    comicsLibrary.getComics(res);
});
app.get('/api/comic/:comic', function (req, res) {
    comicsLibrary.getComic(res, +req.params.comic);
});
app.get('/api/comic/:comic/updateInfos', function (req, res) {
    comicsLibrary.updateComicInfos(res, +req.params.comic);
});
app.post('/api/comic/:comic/updateComicVineId', function (req, res) {
    comicsLibrary.updateComicVineId(res, +req.params.comic, parseInt(req.body.comicVineId));
});
app.get('/api/read/:issue', function (req, res) {
    comicsLibrary.read(res, req.params.issue);
});
app.get('/api/image/:issue/:image', function (req, res) {
    var image = path.resolve("./temp", req.params.issue, req.params.image);
    res.sendFile(image);
});
app.post('/api/readingStatus', function (req, res) {
    comicsLibrary.updateReadingStatus(req.body);
    res.json(comicsLibrary.comics[req.body.folder_name]);
});

app.listen(3001, function () {
    console.log('Example app listening on port 3001!');
});

var schedule = require('node-schedule');
schedule.scheduleJob('0 7 * * 3', function () {
    console.log("[Schedule task] Update library information on: " + new Date());
    comicsLibrary.updateLibraryInfos(null);
});