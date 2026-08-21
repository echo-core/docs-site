# Enabling Ryzen AI NPU for LLMs on Linux (Updated 2026)

This guide covers how to enable and accelerate Large Language Models (LLMs) using the AMD XDNA2 NPU found in modern Ryzen AI processors such as the Ryzen AI 7 PRO 350.

Recent Linux kernels now include AMD's in-tree `amdxdna` driver, which greatly simplifies setup. On modern Arch-based distributions and CachyOS, no DKMS driver installation or source patching is required.

## Prerequisites

- CachyOS, Arch Linux, or another Arch-based distribution
- Ryzen AI processor with integrated AMD NPU
- Current `linux-firmware` package installed

---

# Phase 1: Verify Kernel Support

## 1. Verify the In-Kernel Driver

Modern kernels ship the AMD XDNA driver directly.

Check:

```bash
modinfo amdxdna | grep filename
```

Expected output:

```text
filename: /lib/modules/.../kernel/drivers/accel/amdxdna/amdxdna.ko.zst
```

If the path points to:

```text
kernel/drivers/accel/amdxdna
```

you are using the kernel-integrated driver.

---

## 2. Verify Firmware Availability

Confirm that AMD NPU firmware exists:

```bash
ls /usr/lib/firmware/amdnpu
```

You should see directories similar to:

```text
1502_00
17f0_10
17f0_11
17f0_20
```

Verify that firmware is loading correctly:

```bash
sudo dmesg | grep -i amdxdna
```

Example:

```text
amdxdna 0000:c5:00.1: [drm] Load firmware amdnpu/17f0_10/npu_7.sbin
[drm] Initialized amdxdna_accel_driver
```

---

# Phase 2: Install Userspace Runtime

The kernel driver provides hardware access, but userspace software still requires XRT.

Install:

```bash
sudo pacman -S xrt xrt-plugin-amdxdna
```

Verify installation:

```bash
paru -Q | grep -E 'xrt|xdna'
```

Example:

```text
xrt
xrt-plugin-amdxdna
```

---

# Phase 3: Verify NPU Detection

Use XRT to enumerate devices:

```bash
sudo xrt-smi examine
```

Expected output:

```text
Device(s) Present

[0000:c5:00.1] NPU Krackan 1
```

You should also see:

```text
amdxdna Version
NPU Firmware Version
```

listed in the report.

If your NPU appears here, the kernel driver, firmware, and XRT stack are functioning correctly.

---

# Phase 4: User Permissions

Add your user to the render group:

```bash
sudo usermod -aG render $USER
```

Log out and log back in.

Verify:

```bash
groups
```

You should see:

```text
render
```

listed among your groups.

---

# Phase 5: Install FastFlowLM

Install FastFlowLM:

```bash
sudo pacman -S fastflowlm
```

Verify installation:

```bash
fastflowlm --version
```

---

# Phase 6: Run a Model

Test with a small model first:

```bash
flm run gemma3:1b
```

While inference is running, monitor the NPU:

```bash
sudo xrt-smi examine
```

---

# Troubleshooting

## Verify Driver Status

```bash
lsmod | grep amdxdna
```

Expected:

```text
amdxdna
```

---

## Verify NPU Detection

```bash
sudo xrt-smi examine
```

If the NPU appears in the device list, the hardware stack is functioning correctly.

---

## Validation Warnings

Running:

```bash
sudo xrt-smi validate
```

may produce:

```text
No archive found, skipping test
```

or:

```text
No archive provided, skipping test
```

This usually indicates missing benchmark archives rather than a driver failure. If `xrt-smi examine` successfully detects your NPU, the driver stack is already operational.

---

# Deprecated Information

The following steps are no longer required on current CachyOS kernels:

❌ Installing:

```bash
paru -S amdxdna-dkms
```

❌ Editing:

```text
BUILD_EXCLUSIVE_KERNEL
```

inside DKMS source trees.

❌ Patching:

```c
.num_rqs = DRM_SCHED_PRIORITY_COUNT
```

or other driver source files.

Modern kernels already include the `amdxdna` driver, making these workarounds unnecessary and potentially harmful.

---

# TL;DR

On modern CachyOS releases, Ryzen AI setup is now:

```bash
sudo pacman -S xrt xrt-plugin-amdxdna fastflowlm
sudo usermod -aG render $USER
```

Reboot and verify:

```bash
sudo xrt-smi examine
```

If you see your NPU listed, you're ready to run models.
