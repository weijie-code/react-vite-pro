
#!/bin/bash


workdir=$(cd $(dirname $0); pwd)
# echo $workdir
cd $workdir
yarn
yarn vite

# STR1="abc"
# echo $STR1