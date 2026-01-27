---
sidebar_position: 1
---
# Debian Full Disk Encryption Installation

This was done with a lot of research, trial-and-error, and finally led to success. Eventually, I would like to do a full `debootstrap` installation to avoid some of the annoyances in this article. I would do another article for that setup.

I personally use Debin Sid for this, since the purpose was to roll newer versions of software with the understanding that Sid can break. This provides protection against that breakage and allows for easy rollback if and when that situation arises.

At the time of this writing, Debian Trixie is using GRUB 2.12, which is compatible with luks2, but it only supports the `pbkdf2` algorithm. This installation will do the following:

* Install Debian using the Expert Install option.
* Create an EFI partition.
* Create a luks2 container.
* Create BTRFS root parititon.
* Downgrade pbkdf to `pbkdf2`.
* Install Debian base system.
* Install GRUB Boot Loader.
* Install Snapper and associated tools to make managing snapshots easy.
* Create a base installation snapshot that can be reverted to at anytime.

In addition, the BTRFS subvolumes created ensure that rolling back actually works while balancing ignoring cruft from system snapshots and will not touch a user's `/home` folder. This makes it safe to rollback only the system and not worry about data loss in a user's home folder.

:::warning
Make sure to keep backups anyway, because you never know...
:::

## Install Debian

:::tip
You can grab the latest stable Debian `netinst` iso from **_[here](https://www.debian.org/distrib/netinst)_**.

You can grab the latest unstable Debian `mini` iso from **_[here](https://d-i.debian.org/daily-images/)_**.
:::

1. Boot iso and select the `Advanced Options... > Expert install` option.

2. Run through the install then run the `Partition disks` part of the install in this order.
    * Use gpt partition type
    * Create Partitions
      * EFI - 512MB
      * Create Encrypted Container
        * Set your password to unlock your luks2 volume. Don't lose this, you'll need it to unlock your computer at every boot moving forward.
      * Create a root BTRFS partition.

3. Go to the console: `ctrl+alt+f3`.

4. Unmount Debian's current BTRFS `@rootfs` volume from `/target`.

```bash
umount /target/boot/efi
umount /target
```

5. Downgrade pbkdf of luks2 container from `argon2id` to `pbkdf2`.

```bash
cryptsetup luksConvertKey --pbkdf pbkdf2 /dev/vda2
```
:::tip
This can be upgraded later when GRUB supports `argon2id` and will **_NOT_** require wiping your drive to do this. This will make the installation process much easier when that is implemented as we will only need to focus on the BTRFS subvolumes and not worry about this steps for the GRUB Boot Loader.
:::

6. Mount BTRFS parittion.

```bash
mount /dev/mapper/vda2_crypt /mnt
```

7. Configure BTRFS subvolumes.
```bash
cd /mnt
```
Create optimized subvolumes.
```bash
btrfs sub cr @
btrfs sub cr @grub
btrfs sub cr @home
btrfs sub cr @root
btrfs sub cr @snapshots
btrfs sub cr @srv
btrfs sub cr @var_cache
btrfs sub cr @var_containers
btrfs sub cr @var_libvirt
btrfs sub cr @var_log
btrfs sub cr @var_tmp
```

8. Mount root BTRFS subvolume.

```bash
mount -o subvol=@ /dev/mapper/vda2_crypt /target
```

9. Create needed directories, modify as needed.

```bash
mkdir -p /target/boot/efi
mkdir -p /target/boot/grub/x86_64-efi
mkdir /target/etc
mkdir /target/.snapshots
mkdir /target/home
mkdir /target/root
mkdir /target/srv
mkdir -p /target/var/cache
mkdir -p /target/var/lib/containers
mkdir -p /target/var/lib/libvirt/images
mkdir -p /target/var/log
mkdir -p /target/var/tmp
```
Disable CoW (Copy on Write) for libvirt:
```bash
chattr +C /target/var/lib/libvirt/images
```

10. Mount BTRFS subvolumes and efi partition to `/target` directories.

```bash
mount -o subvol=@grub /dev/mapper/vda2_crypt /target/boot/grub/x86_64-efi
mount -o subvol=@home /dev/mapper/vda2_crypt /target/home
mount -o subvol=@snapshots /dev/mapper/vda2_crypt /target/.snapshots
mount -o subvol=@root /dev/mapper/vda2_crypt /target/root
mount -o subvol=@srv /dev/mapper/vda2_crypt /target/srv
mount -o subvol=@var_cache /dev/mapper/vda2_crypt /target/var/cache
mount -o subvol=@var_containers /dev/mapper/vda2_crypt /target/var/lib/containers
mount -o subvol=@var_libvirt /dev/mapper/vda2_crypt /target/var/lib/libvirt/images
mount -o subvol=@var_log /dev/mapper/vda2_crypt /target/var/log
mount -o subvol=@var_tmp /dev/mapper/vda2_crypt /target/var/tmp
mount /dev/vda1 /target/boot/efi
```

11. Copy fstab and crypttab from @rootfs to `@`.

```bash
cp /mnt/@rootfs/etc/* /target/etc/
```

12. Edit fstab with new BTRFS subvolumes.

```bash
nano /target/etc/fstab
```
```bash
/dev/mapper/vda2_crypt /               btrfs   defaults,noatime,compress=zstd,subvol=@ 0       0
/dev/mapper/vda2_crypt /.snapshots               btrfs   defaults,noatime,compress=zstd,commit=120,subvol=@snapshots 0       0
/dev/mapper/vda2_crypt /boot/grub/x86_64-efi               btrfs   defaults,noatime,compress=zstd,commit=120,subvol=@grub 0       0
/dev/mapper/vda2_crypt /home               btrfs   defaults,noatime,compress=zstd,commit=120,subvol=@home 0       0
/dev/mapper/vda2_crypt /root               btrfs   defaults,noatime,compress=zstd,commit=120,subvol=@root 0       0
/dev/mapper/vda2_crypt /srv               btrfs   defaults,noatime,compress=zstd,commit=120,subvol=@srv 0       0
/dev/mapper/vda2_crypt /var/cache               btrfs   defaults,noatime,compress=zstd,commit=120,subvol=@var_cache 0       0
/dev/mapper/vda2_crypt /var/lib/containers               btrfs   defaults,noatime,compress=zstd,commit=120,subvol=@var_containers 0       0
/dev/mapper/vda2_crypt /var/lib/libvirt/images               btrfs   defaults,noatime,nodatacow,commit=120,subvol=@var_libvirt 0       0
/dev/mapper/vda2_crypt /var/logs               btrfs   defaults,noatime,compress=zstd,commit=120,subvol=@var_logs 0       0
/dev/mapper/vda2_crypt /var/tmp               btrfs   defaults,noatime,compress=zstd,commit=120,subvol=@var_tmp 0       0
```

13. Remove old BTRFS `@rootfs` (Debian default root volume) subvolume.

```bash
btrfs sub del /mnt/@rootfs
umount /mnt
```

14. Continue installation: `ctrl+alt+f1`.
      * Install base system
      * Configure package manager
      * Select and install software - standard system utilities only

15. Install the GRUB boot loader: when grub-install fails go back to the console with `ctrl+alt+f3`.

16. Edit the default grub config to allow for crypt volumes.

```bash
echo "GRUB_ENABLE_CRYPTODISK=y" >>/target/etc/default/grub
```

17. Go back the install console: `ctrl+alt+f1`.

18. Run `Install the GRUB boot loader` again, it should finish successfully this time.

19. Finish the installation and then reboot.

## Create key to keep from being asked for two passwords

1. Generate the root partition encryption key.

```bash
mkdir -m0700 /etc/keys
( umask 0077 && dd if=/dev/urandom bs=1 count=64 of=/etc/keys/root.key conv=excl,fsync )
cryptsetup luksAddKey /dev/vda2 /etc/keys/root.key
cryptsetup luksDump /dev/vda2 | grep "^Keyslots" -A16
```
Output:
```bash
Keyslots:
  0: luks2
...
Keyslots:
  1: luks2
```

2. Modify `crypttab` with new key for the root device entry.

```bash
cat /etc/crypttab
vda2_crypt UUID=… /etc/keys/root.key luks,discard,x-initrd.attach,key-slot=1
```

3. Add a glob to look for keys automatically in the `cryptsetup-initramfs` hook.

```bash
echo "KEYFILE_PATTERN=\"/etc/keys/*.key\"" >>/etc/cryptsetup-initramfs/conf-hook
```

4. Set the `UMASK` to prevent key leakage.

```bash
echo UMASK=0077 >>/etc/initramfs-tools/initramfs.conf
```

5. Regenerate the initramfs image.

```bash
update-initramfs -u -k all
```

6. Make sure the permissions are restrictive on the initramfs.

```bash
stat -L -c "%A  %n" /initrd.img
-rw-------  /initrd.img
```

7. Verify the key file has been imported into the initrd image.

```bash
lsinitramfs /initrd.img | grep "^cryptroot/keyfiles/"
cryptroot/keyfiles/vda2_crypt.key
```

8. Reboot and you should only be presented with the initial password on boot then you will hit the grub boot menu.

```bash
sudo reboot
```

## Configure snapper and grub-btrfs

1. Install snapper.

```bash
sudo apt install snapper inotify-tools build-essential git wget curl
```

2. On installation, `snapper` created a new BTRFS subvolume (`/.snapshots`) during the install, but we want to use ours since we're using a flat BTRSFS subvolume layout. So let's remove the one it created and use ours again.

```bash
cd /
sudo umount .snapshots
sudo rm -r .snapshots
```

3. Create a new snapper config for the `@` subvolume.

```bash
sudo snapper -c root create-config /
```

4. Delete the snapper created subvolume.

```bash
sudo btrfs subvolume delete /.snapshots
```

5. Use our `@snapshots` subvolume.

```bash
sudo mkdir /.snapshots
sudo mount -av
```

6. Disable the snapper boot time snapshots (unless you want them).

```bash
sudo systemctl disable snapper-boot.timer
```

7. Set the following snapper configs.

```bash
sudo nano /etc/snapper/configs/root
```
Recommended configuration for `root`, but can be tweaked to your liking.
```
SUBVOLUME="/"
FSTYPE="btrfs"
ALLOW_GROUPS="sudo"
SYNC_ACL="yes"
BACKGROUND_COMPARISON="yes"
NUMBER_CLEANUP=yes"
NUMBER_MIN_AGE"1800"
NUMBER_LIMIT="20"
NUMBER_LIMIT_IMPORTANT="10"
TIMELINE_CREATE="no"
TIMELINE_CLEANUP="yes"
TIMELINE_MIN_AGE="1800"
TIMELINE_LIMIT_HOURLY="5"
TIMELINE_LIMIT_DAILY="7"
TIMELINE_LIMIT_WEEKLY="0"
TIMELINE_LIMIT_YEARLY="0"
EMPTY_PRE_POST_CLEANUP="yes"
EMPTY_PRE_POST_MIN_AGE="1800"
```

8. Install grub-btrfs.

```bash
cd ~
mkdir git
cd git
git clone https://github.com/Antynea/grub-btrfs.git
cd grub-btrfs
sudo make install
```

9. Enable and start service.

```bash
sudo systemctl enable grub-btrfsd
sudo systemctl start grub-btrfsd
```

## More useful snapshot descriptions

1. Backup existing snapper apt config.

```bash
cp /etc/apt/apt.conf.d/80snapper /etc/apt/apt.conf.d/80snapper~
```

2. Clone scripts.

```bash
cd ~/git
git clone https://gist.github.com/f722f6d08dfb404fed2a3b2d83263118.git dpkg-pre-post-snapper
cd dpkg-pre-post-snapper
```

3. Install scripts.

```bash
chmod +x dpkg-pre-post-snapper.sh
sudo cp dpkg-pre-post-snapper.sh /usr/local/sbin/dpkg-pre-post-snapper
sudo cp 80snapper /etc/apt/apt.conf.d/
```

4. Edit dpkg-pre-post-snapper location and modify the `/path/to/` to `/usr/local/sbin/`.

```bash
sudo nano /etc/apt/apt.conf.d/80snapper
```
Modify the script to look like below.
```bash
# https://gist.github.com/imthenachoman/f722f6d08dfb404fed2a3b2d83263118
# https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=770938

DPkg::Pre-Invoke { "/usr/local/sbin/dpkg-pre-post-snapper pre"; };
DPkg::Post-Invoke { "/usr/local/sbin/dpkg-pre-post-snapper post"; };
```

5. Create a baseline snapshot.

```bash
sudo snapper -c root create -d "base-install" -u important=yes
```
:::tip
Keep this snapshot around as you can use it to rollback to the base installation at anytime.
:::

Old output:
```bash
  # | Type   | Pre # | Date | User | Cleanup | Description  | Userdata
----+--------+-------+------+------+---------+--------------+---------------
 0  | single |       | ...  | root |         | current      |
 1  | single |       | ...  | root |         | base-install | important=yes
 2  | pre    |       | ...  | root | number  | apt          |
 3  | post   |     2 | ...  | root | number  | apt          |
```

New improved output with more info in the `Description` table:
```bash
  # | Type   | Pre # | Date | User | Cleanup | Description                | Userdata
----+--------+-------+------+------+---------+----------------------------+---------------
 0  | single |       | ...  | root |         | current                    |
 1  | single |       | ...  | root |         | base-install               | important=yes
 2  | pre    |       | ...  | root | number  | apt install btrfs-compsize |
 3  | post   |     2 | ...  | root | number  | apt install btrfs-compsize |
```
This will help greatly to have an idea of what changes happened in our last snapshots.

## Install snapper-rollback for easy snapper rollbacks

1. Downlad and install scripts and dependencies.

```bash
cd ~/git
git clone https://github.com/jrabinow/snapper-rollback.git
cd snapper-rollback
sudo cp snapper-rollback.py /usr/local/sbin/snapper-rollback
sudo cp snapper-rollback.conf /etc/
sudo apt install python3-btrfsutil
```

2. Edit snapper-rollback.conf.

```bash
sudo nano /etc/snapper-rollback.conf
```
```bash
subvol_main = @
subvol_snapshots = @snapshots
mountpoint = /tmp/snapper-rollback-mnt
dev = /dev/mapper/vda2_crypt
```

3. Example rollback as seen [here](https://github.com/jrabinow/snapper-rollback?tab=readme-ov-file#example-usage).

```bash
sudo snapper list
 # | Type   | Pre # | Date                            | User | Cleanup  | Description  | Userdata
 ---+--------+-------+---------------------------------+------+----------+--------------+---------------------
 0  | single |       |                                 | root |          | current      |
 1  | single |       | Mon 19 Jul 2021 08:59:01 PM PDT | root |          | base-install |
 2  | single |       | Fri 30 Jul 2021 10:00:08 PM PDT | root | timeline | timeline     |
 3  | single |       | Fri 30 Jul 2021 11:00:08 PM PDT | root | timeline | timeline     |
```
```bash
sudo snapper-rollback 1        # let's revert back to the snapshot whos description is `base-install`
Are you SURE you want to rollback? Type 'CONFIRM' to continue: CONFIRM
2021-10-17 23:25:47,889 - INFO - Rollback to /@snapshots/1/snapshot complete. Reboot to finish
```

## Notes
* This article is geared to towards Debian and its installer.
* Once Grub2 gets luks2 support with argon2 the kbkdf can get upgraded to argon2 again.
* I would much rather use the limine bootloader with snapper and limine-snapper-sync, but alas, I haven't gotten that configuration working as of yet in Debian... Maybe in a future article...

## References
* [Debian 12 with LUKS, BTRFS, and subvolumes](https://www.matuck.com/tech/2023/09/03/Debian-12-with-LUKS,-BTRFS,-and-subvolumes.html)
* [Installing Debian with BTRFS, snapper, and grub-btrfs](https://medium.com/@inatagan/installing-debian-with-btrfs-snapper-backups-and-grub-btrfs-27212644175f)
* [Better snapshot descriptions](https://gist.github.com/imthenachoman/f722f6d08dfb404fed2a3b2d83263118)
* [Full disk encryption, including /boot: Unlocking LUKS devices from GRUB](https://cryptsetup-team.pages.debian.net/cryptsetup/encrypted-boot.html)
* [CachyOS Wiki - Filesystem - BTRFS - Subvolume Layout](https://wiki.cachyos.org/installation/filesystem/#subvolume-layout)
* [Conversion from LUKS1 to LUKS2 and back](https://wiki.archlinux.org/title/Dm-crypt/Device_encryption#Conversion_from_LUKS1_to_LUKS2_and_back)
* [JWillikers BTRFS Layout](https://www.jwillikers.com/btrfs-layout)
* [openSUSE Default Subvolumes](https://en.opensuse.org/SDB:BTRFS#Default_Subvolumes)
* [snapper-rollback Github](https://github.com/jrabinow/snapper-rollback)
