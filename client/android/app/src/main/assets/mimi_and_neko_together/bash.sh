#!/bin/bash
for file in *.webp; do
    mv -- "$file" "$(basename -- "$file" .webp).png"
done
for apng in *.png; do
    ./apng2gif "$apng"
done


