#!/bin/bash
echo build...
ng build -watch&
tsc -w&
exit 0