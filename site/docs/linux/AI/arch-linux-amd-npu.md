# Enabling Ryzen AI NPU for LLMs on Linux

This guide covers how to enable and accelerate Large Language Models (LLMs) using the **AMD XDNA2 NPU** (found in processors like the Ryzen AI 7 PRO 350). Because this hardware is cutting-edge, it requires specific driver patches to bridge the gap between the current Linux kernel and the hardware.

## Prerequisites
*   A system running an Arch Linux derivative (e.g., CachyOS, EndeavourOS, Manjaro).
*   A processor with an integrated AMD Ryzen AI NPU.

---

## Phase 1: Driver & Kernel Preparation

The XDNA2 architecture requires a specific driver stack to be recognized by the OS. Because this hardware is very new, we must manually patch the driver to ensure compatibility with modern kernels.

### 1. Verify Firmware
Ensure your system has the necessary firmware files located in `/usr/lib/firmware/amdnpu`. Most Arch-based distributions include these by default.

### 2. Install the AMD XDNA Driver (DKMS)
Install the driver via the AUR:
```bash
paru -S amdxdna-dkms
```

### 3. Bypass Kernel Restrictions
The driver will fail to compile initially because it contains a hard-coded block against newer kernels. You must manually remove this restriction:
*   Open `/var/lib/dkms/amdxdna/7.0/source/dkms.conf` in a text editor.
*   Find the line `BUILD_EXCLUSIVE_KERNEL="^6\.(17|18|19)\."%` and change it to an empty string: `BUILD_EXCLUSIVE_KERNEL=""`.

### 4. Patch the Source Code (Kernel API Mismatch)
Recent changes in the Linux Kernel's DRM subsystem have caused a conflict with the current driver source. You must perform "surgery" on the code to allow compilation:
*   Open `/var/lib/dkms/amdxdna/7.0/source/aie2_ctx.c` in a text editor.
*   Find line 556 (or search for `num_rqs`) and comment out the offending line:
    ```c
    // .num_rqs = DRM_SCHED_PRIORITY_COUNT,
    ```
*   Save and exit the editor.
*   **Re-compile and install the patched driver:**
    ```bash
    sudo dkms install amdxdna/7.0 -k $(uname -r)
    ```

### 5. Verify Hardware Detection
Confirm that the driver is active and the NPU is recognized by the XRT (Xilinx Runtime) subsystem:
*   Check module load: `lsmod | grep amdxdna`
*   Verify hardware detection: `sudo xrt-smi examine`
    *   *Look for a device entry such as `RyzenAI-npu6`.*

---

## Phase 2: The Inference Engine

Once the driver is active, you need an engine to translate LLM operations into NPU instructions.

### 6. Install FastFlowLM
Install the inference engine from the official Arch repositories:
```bash
sudo pacman -S fastflowlm
```
*This package provides the necessary binaries and XRT plugins to run models on the Ryzen AI hardware.*

---

## Phase 3: Permissions & Optimization

To run models as a standard user without needing `sudo` every time, you must configure your system's resource limits.

### 7. Group Access
Add your user to the `render` group to gain permission to access the NPU hardware nodes directly:
```bash
sudo usermod -aG render $USER
```
*(Note: You **must** log out and log back in for this change to take effect.)*

### 8. Memory Locking (Memlock)
LLMs require a large amount of RAM to be "locked" in place so they aren't swapped to the disk, which would significantly slow down inference. Create a limits configuration file:
*   Create `/etc/security/limits.d/90-npu.conf`.
*   Add these lines (replace `yourusername` with your actual username):
    ```text
    yourusername soft memlock unlimited
    yourusername hard memlock unlimited
    ```

---

## Phase 4: Execution

### 9. Run the Model
You can now run models directly using the `flm` command. To start with a lightweight model to verify performance, use the Gemma 3 1B model:

```bash
flm run gemma3:1b
```

**How to Verify Success:**
*   **CPU Usage:** Open `htop`. If your CPU usage remains low while text is being generated, the NPU is successfully handling the workload.
*   **NPU Activity:** Run `sudo xrt-smi examine` during generation. You should see activity or utilization on the `RyzenAI-npu6` device.
