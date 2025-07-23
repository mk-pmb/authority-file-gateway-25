#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function dksrv_cli_init () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local REPOPATH="$(readlink -m -- "$BASH_SOURCE"/../..)"
  cd -- "$REPOPATH" || return $?
  [ -n "$USER" ] || export USER="$(whoami)"

  echo D: "$0 starting as $USER in $PWD"

  if [ "$1" == --ransack-host-os ]; then
    shift
  elif [ "$USER|$REPOPATH" == 'root|/app' ]; then
    true
  else
    echo E: "Expected to run as root in /app (thus assuming: in docker)," \
      "or with option '--ransack-host-os'." >&2
    return 8
  fi

  dksrv_maybe_npm_install || return $?
  exec ./node_modules/.bin/nodemjs src/server.mjs
}


function dksrv_maybe_npm_install () {
  ln --symbolic --force --no-target-directory \
    -- "$REPOPATH"/devdock/fixtures/npmrc.ini "$HOME"/.npmrc || return $?
  local DONE='node_modules/install.done'
  grep -PHe . "$DONE" && return 0
  npm install . || return $?
  date +R >"$DONE"
}










dksrv_cli_init "$@"; exit $?
