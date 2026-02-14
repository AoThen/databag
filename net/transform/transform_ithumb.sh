#!/bin/sh
nice -n 5 magick convert -strip $1 -coalesce -auto-orient -resize '192x192' $2
