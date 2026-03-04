# UniFi Chromecast Inter‑VLAN Configuration Guide

This document is a basic configuration guide for **Chromecast devices across VLANs** in a UniFi environment.

It was configured on a UniFi Dream Machine Pro (UDM Pro) with UniFi switches and access points.

## Network Model

- **User VLAN**
  - Phones, laptops, tablets
- **IoT VLAN**
  - Chromecast devices
  - Android TV / Google TV devices

## Required Ports and Protocols

### Discovery (Multicast)

Chromecast uses multicast for discovery, not for streaming.

| Protocol | Destination | Port | Purpose |
|--------|------------|------|--------|
| UDP | 224.0.0.251 | 5353 | mDNS (primary discovery) |
| UDP | 239.255.255.250 | 1900 | SSDP / DIAL |

> mDNS is **link‑local** and does **not** cross VLANs unless explicitly forwarded.

### Control & Session Setup (Unicast)

These ports are required for pairing, control, and casting initiation:

| Protocol | Port |
|--------|------|
| TCP | 8008 |
| TCP | 8009 |
| TCP | 8443 |

### Media & Mirroring (Unicast)

These ports are required for screen mirroring, tab casting, and local media:

| Protocol | Port(s) | Notes |
|--------|---------|------|
| UDP | 10008 | Required for mirroring |
| UDP | 32768–61000 | Dynamic RTP/RTCP media streams |

> **Important:**
> Internet streaming (YouTube, Netflix, Spotify) may work *without* these ports.
> Mirroring will **fail** unless they are allowed.

## UniFi mDNS Configuration

### Enable mDNS on
- User VLAN
- IoT VLAN

### Restrict mDNS services to ONLY
- Android TV Remote
- DNS Service Discovery
- Google Chromecast

This allows discovery while avoiding multicast noise and VLAN leakage.

## IGMP Snooping Configuration

IGMP Snooping helps with overall connection stability.

### Enable IGMP Snooping on
- User VLAN

### Recommended settings
- Auto Querier Selection
- Fast Leave
- Auto Unknown Traffic Handling

### This helps
- Prevents multicast flooding
- Keeps group membership alive
- Eliminates pixelation and delayed joins

### Notes
- IGMP snooping is **not a replacement** for mDNS forwarding
- Do **not** rely on flooding

## Firewall Rule Design

### Recommended approach
- Scope rules to **Chromecast / Android TV IPs**
  - Use static dhcp reservations
- Allow only required ports
- Avoid “allow all UDP” rules

## Validation Checklist

- Chromecast appears across VLANs
- Casting starts immediately
- Screen mirroring works
- No pixelation or stutter

If mirroring fails:
- Check **UDP 10008**
- Check UDP return traffic
- Verify IGMP group membership

## Common Issues

| Symptom | Likely Cause |
|------|------------|
| Device appears but won’t connect | TCP 8009 blocked |
| Streaming works, mirroring fails | UDP 10008 blocked |
| Random stutter / pixelation | IGMP snooping missing or mis‑placed |
| Discovery intermittent | mDNS too broad or not forwarded |

## Final Notes

Verified working on:
- UniFi Dream Machine Pro
- UniFi Layer 3 switches (IGMP snooping enabled)
- Wireless Chromecast / Android TV
- Inter‑VLAN routing with firewall enforcement

## References
- [UniFi Chromecast Best Practices](https://help.ui.com/hc/en-us/articles/4409866388887-Best-Practices-for-Chromecast-and-AirPlay)
- [Google Cast Moderator Network Requirements](https://support.google.com/chrome/a/answer/12256492?hl=en)
