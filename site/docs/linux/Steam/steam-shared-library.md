# Steam Shared Library

This document will walk through the steps to setup a shared Steam Library so that all users on one computer can share the same game files. It assumes you are using `btrfs` as your root filesystem.

## Create mount and directory

_This will avoid snapshot rollbacks messing with your game files and allow you to setup independant snapshots if you want:_
```
BTRFS_MNT=$(findmnt -n -o SOURCE / | sed 's/\[.*//' | awk -F/ '{print $NF}') \
sudo mkdir -p /data \
sudo mount -o subvol=/ /dev/mapper/$BTRFS_MNT /mnt \
sudo btrfs subvolume create /mnt/@data \
cat << EOF >>/etc/fstab
/dev/mapper/$BTRFS_MNT /data          btrfs   subvol=/@data,defaults,noatime,compress=zstd,commit=120 0 0
EOF \
sudo umount /mnt \
sudo systemctl daemon-reload \
sudo mount -av \
mkdir -p /data/games
```
:::tip Once done, just verify the output of your `/etc/fstab` looks correct. It should look something like below.
```
cat /etc/fstab|grep /data
/dev/mapper/luks-72289a87-7aed-4559-a334-794c3557834a /data          btrfs   subvol=/@data,defaults,noatime,compress=zstd,commit=120 0 0
```
:::
## Add user(s) to the `games` group
```
sudo usermod -a -G games <user>
```
## Set directory permissions and default permissions
```
sudo chown root:games /data/games
sudo setfacl -d -m g:games:rwx /data/games
```
## For existing libraries, you can set your new default permissions recursively
```
getfacl -d /data/games|sudo setfacl -d -R --set-file=- /data/games
```
## Verify permissions
```
getfacl /data/games
# file: data/games
# owner: root
# group: games
user::rwx
group::rwx
group:games:rwx
mask::rwx
other::r-x
default:user::rwx
default:group::rwx
default:group:games:rwx
default:mask::rwx
default:other::r-x
```
## Configure Steam

You should now be able login to Steam and add the new library and move the games files around without issue. Other users on the computer within the `games` group should be able to use the library.
```
Steam > Settings > Storage > Add Drive + > Let me choose another location > Add > Browse to `/data/games` > Click `Ok`.
```
_Set the new library as the default and download or move some games to it._
