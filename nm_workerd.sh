#!/bin/bash
exec "$HOME/bin/workerd" serve "$PWD/config" -b --import-path="$PWD" --directory-path=site-files="$HOME/Downloads"