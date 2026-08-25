#!/bin/bash
# include this boilerplate
function jumpto
{
    label=$1
    cmd=$(sed -n "/$label:/{:a;n;p;ba};
" $0 | grep -v ':$')
    eval "$cmd"
    exit
}

start=${1:-"start"}

jumpto $start

start:
jumpto test

test:
bash run.sh
jumpto foo

foo:
jumpto test