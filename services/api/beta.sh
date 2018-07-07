read -p "This script will deploy to beta. Continue? [Y/N]" -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]
then
  git push api-beta master:master
fi
