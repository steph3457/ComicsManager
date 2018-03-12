#!/bin/bash
echo build angular...
ng build --aot=false --prod
echo angular build finished
echo tsc...
tsc
echo tsc finished
echo precache...
sw-precache --root=dist --config=sw-precache-config.js
echo precache finished
exit 0