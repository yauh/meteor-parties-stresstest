#!/bin/bash

# populate Drones
declare -a Drones=()
while read line; do Drones=("${Drones[@]}" "$line"); done < drones

# kill the immortalCasper
for i in "${Drones[@]}"
do
   ssh $i "pid=\$(ps aux | grep 'immortalCasper.sh' | awk '{print \$2}' | head -1); echo \$pid |xargs kill"
   echo Stopped the immortal Casper on $i
done
