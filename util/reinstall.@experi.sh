#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-
set -e
export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
cd -- "$(readlink -m -- "$BASH_SOURCE"/../..)"

reex
NPMI='npm install'
NPMI+=' --no-metrics'
NPMI+=' --no-audit'
NPMI+=' --no-package-lock'
NPMI+=' --no-update-notifier'
NPMI+=' --ignore-scripts'
$NPMI .
date -R >node_modules/install.done

NM_HSB='node_modules/@ubhd-as22/http-server-base'
[ -L "$NM_HSB" ] || [ ! -e "$NM_HSB" ] || rm -vrf -- "$NM_HSB"
ln -vsT -- ../../hsb.@experi node_modules/@ubhd-as22/http-server-base
( cd -- hsb.@experi && reex && $NPMI . )

for D in . hsb.@experi; do
  echo "== $D =="
  ( cd -- "$D" && git branch -v && git status --short -uall )
done

TZ=UTC printf -- 'D: Done after %(%T)T.\n' $SECONDS
