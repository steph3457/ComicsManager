import "reflect-metadata";
import * as express from "express";
import * as path from "path";
import * as logger from "morgan";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import * as compression from "compression";
import { ComicsLibrary } from "./src/lib/ComicsLibrary";
import * as fs from "fs";

const app = express();
const comicsLibrary = new ComicsLibrary(false);
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
app.use(express.static(__dirname));

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/comic", function(req, res) {
    res.redirect("/");
});
app.get("/reader", function(req, res) {
    res.redirect("/");
});
app.get("/library", function(req, res) {
    res.redirect("/");
});
app.get("/config", function(req, res) {
    res.redirect("/");
});

app.get("/api/config", function(req, res) {
    comicsLibrary.getConfig(res);
});
app.post("/api/config", function(req, res) {
    comicsLibrary.saveConfig(res, req.body);
});
app.get("/api/comics", function(req, res) {
    comicsLibrary.getComics(res);
});
app.post("/api/comics/create", function(req, res) {
    comicsLibrary.createComic(res, req.body.comicTitle, req.body.comicYear);
});
app.get("/api/comics/parse", function(req, res) {
    comicsLibrary.parseComics(res);
});
app.get("/api/comics/updateInfos", function(req, res) {
    comicsLibrary.updateLibraryInfos(res);
});
app.get("/api/comics/findExactMapping", function(req, res) {
    comicsLibrary.findExactMapping(res);
});
app.get("/api/comic/:comic", function(req, res) {
    comicsLibrary.getComic(res, +req.params.comic);
});
app.get("/api/comic/:comic/updateInfos", function(req, res) {
    comicsLibrary.updateComicInfos(res, +req.params.comic);
});
app.get("/api/comic/:comic/toggleFinished", function(req, res) {
    comicsLibrary.toggleComicFinished(res, +req.params.comic);
});
app.post("/api/comic/:comic/updateComicVineId", function(req, res) {
    comicsLibrary.updateComicVineId(
        res,
        +req.params.comic,
        parseInt(req.body.comicVineId, 10)
    );
});
app.get("/api/issues/parse", function(req, res) {
    comicsLibrary.parseIssues(res);
});
app.post("/api/issue/:issue/updateComic", function(req, res) {
    comicsLibrary.updateIssueComicId(
        res,
        +req.params.issue,
        parseInt(req.body.comicId, 10)
    );
});
app.delete("/api/issue/:issue", function(req, res) {
    comicsLibrary.deleteIssue(res, +req.params.issue);
});
app.get("/api/read/:issue", function(req, res) {
    comicsLibrary.read(res, req.params.issue);
});
app.get("/api/image/:issue/:image", function(req, res) {
    const image = path.resolve("./temp", req.params.issue, req.params.image);
    res.sendFile(image);
});
app.post("/api/readingStatus", function(req, res) {
    comicsLibrary.updateReadingStatus(res, req.body);
});

app.listen(3001, function() {
    console.log("Example app listening on port 3001!");
});

const schedule = require("node-schedule");
schedule.scheduleJob("0 7 * * 3", function() {
    console.log("[Schedule task] Update library information on: " + new Date());
    comicsLibrary.updateLibraryInfos(null);
});
