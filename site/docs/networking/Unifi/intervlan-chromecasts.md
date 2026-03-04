# UniFi Chromecast Inter‑VLAN Configuration Guide

This document is a basic configuration guide for **Chromecast devices across VLANs** in a UniFi environment.

It was configured on a UniFi Dream Machine Pro (UDM Pro) with UniFi switches and access points.

---

## Network Model

- **User VLAN**
  - Phones, laptops, tablets
- **IoT / Media VLAN**
  - Chromecast
  - Chromecast Ultra
  - Android TV / Google TV devices

Traffic is routed at Layer 3 (UDM Pro), not bridged.

---

## 1. Required Ports and Protocols

### 1.1 Discovery (Multicast – MUST be forwarded)

Chromecast uses multicast **only for discovery**, not for streaming.

| Protocol | Destination | Port | Purpose |
|--------|------------|------|--------|
| UDP | 224.0.0.251 | 5353 | mDNS (primary discovery) |
| UDP | 239.255.255.250 | 1900 | SSDP / DIAL |

> mDNS is **link‑local** and does **not** cross VLANs unless explicitly forwarded.

---

### 1.2 Control & Session Setup (Unicast)

These ports are required for pairing, control, and casting initiation:

| Protocol | Port |
|--------|------|
| TCP | 8008 |
| TCP | 8009 |
| TCP | 8443 |

---

### 1.3 Media & Mirroring (Unicast – Often Missed)

These ports are required for **screen mirroring, tab casting, and local media**:

| Protocol | Port(s) | Notes |
|--------|---------|------|
| UDP | **10008** | Required for mirroring (documented by Google, often omitted) |
| UDP | 32768–61000 | Dynamic RTP/RTCP media streams |

> **Important:**
> Internet streaming (YouTube, Netflix, Spotify) may work *without* these ports.
> Mirroring will **fail** unless they are allowed.

---

## 2. UniFi mDNS Configuration

### Enable mDNS on:
- ✅ **User VLAN**
- ✅ **IoT / Media VLAN**

### Restrict mDNS services to ONLY:
- ✅ Android TV Remote
- ✅ DNS Service Discovery
- ✅ Google Chromecast

> Do **not** enable blanket mDNS / Bonjour forwarding.

This allows discovery while avoiding multicast noise and VLAN leakage.

---

## 3. IGMP Snooping Configuration (Critical for Stability)

### Enable IGMP Snooping on:
✅ **User VLAN**

### Recommended settings:
- ✅ **Auto Querier Selection**
- ✅ **Fast Leave**
- ✅ **Auto / Allow Unknown Multicast**

### Why this works:
- Prevents multicast flooding
- Keeps group membership alive
- Eliminates pixelation and delayed joins
- Improves behavior for **wired Chromecasts** (Ultra, Android TV)

### Notes:
- IGMP snooping is **not a replacement** for mDNS forwarding
- Do **not** rely on flooding

---

## 4. Firewall Rule Design (Best Practice)

### Recommended approach:
- Scope rules to **Chromecast / Android TV IPs**
- Allow only required ports
- Avoid “allow all UDP” rules

### Why:
- Chromecast uses **unsolicited UDP return traffic**
- Stateful firewalls (UDM Pro) will drop this unless explicitly allowed
- UDP 10008 is commonly logged as “blocked” during mirroring attempts

---

## 5. Validation Checklist

✅ Chromecast appears across VLANs
✅ Casting starts immediately
✅ Screen mirroring works
✅ No pixelation or stutter
✅ No multicast flooding
✅ Firewall logs are clean

If mirroring fails:
- Check **UDP 10008**
- Check UDP return traffic
- Verify IGMP group membership

---

## 6. Common Failure Modes

| Symptom | Likely Cause |
|------|------------|
| Device appears but won’t connect | TCP 8009 blocked |
| Streaming works, mirroring fails | UDP 10008 blocked |
| Random stutter / pixelation | IGMP snooping missing or mis‑placed |
| Discovery intermittent | mDNS too broad or not forwarded |
| Works on Wi‑Fi, not Ethernet | Missing IGMP snooping on user VLAN |

---

## 7. Key Takeaways

- Chromecast **does use multicast**, but **only for discovery**
- Mirroring requires **UDP 10008**
- mDNS must be **forwarded**, not flooded
- IGMP snooping belongs on the **user VLAN**
- A tight, scoped configuration is **more stable** than permissive rules

---

## Status

✅ Verified working on:
- UniFi Dream Machine Pro
- UniFi switches (IGMP snooping enabled)
- Wired and wireless Chromecast / Android TV
- Inter‑VLAN routing with firewall enforcement

This configuration has been validated with **real firewall logs and live testing**, not assumptions.

---
