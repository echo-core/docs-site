# Steam Shared Library

This document will walk through the steps to setup a shared Steam Library so that all users on one computer can share the same game files.

1. Create a new `btrfs` mount and global directory to share my Steam library files among users on the same box. This will avoid snapshot rollbacks messing with your game files and allow you to setup independant snapshots if you want:
```
sudo mkdir -p /data \
sudo mount -o subvol=/ /dev/mapper/luks-<UUID> /mnt \
sudo btrfs subvolume create /mnt/@data \
cat << EOF >>/etc/fstab
/dev/mapper/luks-<UUID> /data          btrfs   subvol=/@data,defaults,noatime,compress=zstd,commit=120 0 0
EOF \
sudo umount /mnt \
sudo systemctl daemon-reload \
sudo mount -av \
mkdir -p /data/games
```
2. Add user(s) to the `games` group:
```
sudo usermod -a -G games <user>
```
3. Set directory permissions and default permissions:
```
sudo chown root:games /data/games
sudo setfacl -d -m g:games:rwx /data/games
```
4. For existing libraries, you can set your new default permissions recursively:
```
getfacl -d /data/games|sudo setfacl -d -R --set-file=- /data/games
```
5. Verify permissions:
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
6. You should now be able login to Steam and add the new library and move the games files around without issue. Other users on the computer within the `games` group should be able to use the library.
```
Steam > Settings > Storage > Add Drive + > Let me choose another location > Add > Browse to `/data/games` > Click `Ok`.
```
7. Set the new library as the default and download or move some games to it.
