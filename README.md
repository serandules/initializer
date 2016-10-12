# initializer

find */.git -iname "config" | xargs grep -l "https://github.com" | xargs sed -i -e 's/https:\/\/github.com/https:\/\/serandomps@github.com/g'