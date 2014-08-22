#!/bin/bash
kill $(ps aux | grep 'immortalCasper' | awk '{print $2}')
