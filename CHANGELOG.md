# Changelog

## [0.2.0](https://github.com/drfarr/figma-mcp-for-nothing/compare/figma-mcp-but-free-v0.1.0...figma-mcp-but-free-v0.2.0) (2026-04-30)


### Features

* add Bridge progress message handling with timeout extension ([d3b418a](https://github.com/drfarr/figma-mcp-for-nothing/commit/d3b418aa0b9841104107226f40b280db6d2534b8))
* add Bridge send/timeout with request tracking ([6a1c687](https://github.com/drfarr/figma-mcp-for-nothing/commit/6a1c687321930897d47668aac47ffde3fec8b490))
* add Bridge WebSocket class with type definitions ([f68229d](https://github.com/drfarr/figma-mcp-for-nothing/commit/f68229dac49973c1af0c41cc0e419b23a95ab2f6))
* add CI and release workflows with commit linting and npm publishing ([564c59b](https://github.com/drfarr/figma-mcp-for-nothing/commit/564c59bea2fbfe2518d29599b5112e160a1ec5b5))
* add configuration files for Biome formatter and linter ([bad50e5](https://github.com/drfarr/figma-mcp-for-nothing/commit/bad50e5706a3b2fc7f8bb0affc080a89e3a4db71))
* add Figma plugin code.js with message handler and basic read tools ([f2fdc3e](https://github.com/drfarr/figma-mcp-for-nothing/commit/f2fdc3ef0219dd3331dafc36c2b7aece59d5821a))
* add Figma plugin manifest.json ([405d75f](https://github.com/drfarr/figma-mcp-for-nothing/commit/405d75fa5cf59de4e60cb3205e5ea437d203e843))
* add get_design_context, search_nodes, scan_text_nodes, scan_nodes_by_types tools ([41518b4](https://github.com/drfarr/figma-mcp-for-nothing/commit/41518b4bc46c68466a5373d7cb459cfaf22c9f1d))
* add get_screenshot and export_tokens read tools ([8f555d5](https://github.com/drfarr/figma-mcp-for-nothing/commit/8f555d52e893306eaa17e556b96dc118e9278e4d))
* add meta tools (get_connection_status, batch) ([45f7ea7](https://github.com/drfarr/figma-mcp-for-nothing/commit/45f7ea730e16b184e241ac64c5c676f19db60d6c))
* add nodeId normalization utility ([9627f2d](https://github.com/drfarr/figma-mcp-for-nothing/commit/9627f2d16752b6830a2a632f0e2c569870104a07))
* add plugin auto-reconnect with 3s retry and timestamped logs ([85af586](https://github.com/drfarr/figma-mcp-for-nothing/commit/85af5867aed84951efcebb77b2ed0386ef10a0d2))
* add plugin component handlers (group, ungroup, swap, detach) ([912f980](https://github.com/drfarr/figma-mcp-for-nothing/commit/912f98073fd5ea5919afd9c37dd8c52c3b46b1fd))
* add plugin create handlers (frame, rect, ellipse, text, image, component, section) ([5588b01](https://github.com/drfarr/figma-mcp-for-nothing/commit/5588b01e13cf9e87a487e9d35370da80f97d6dc3))
* add plugin hexToRgb utility and getParent helper ([90537ea](https://github.com/drfarr/figma-mcp-for-nothing/commit/90537ea4e71e08925df3363597f2760d2f34de6a))
* add plugin modify handlers (setText, setFills, setStrokes, setOpacity, etc.) ([389f858](https://github.com/drfarr/figma-mcp-for-nothing/commit/389f858d4c451e917f66e0838fe9800f6ba7cc99))
* add plugin page handlers ([5ac0b7f](https://github.com/drfarr/figma-mcp-for-nothing/commit/5ac0b7f990dab6b95404b02ff752536f235ef573))
* add plugin prototype reaction handlers ([a915c8f](https://github.com/drfarr/figma-mcp-for-nothing/commit/a915c8f86ef8d989557a181c24fa28fe916793da))
* add plugin read helpers for styles, variables, components, and fonts ([4d79c7d](https://github.com/drfarr/figma-mcp-for-nothing/commit/4d79c7dc3251303548aa792a1ac1b4b993c9704e))
* add plugin style handlers (paint, text, effect, grid styles) ([b5feebd](https://github.com/drfarr/figma-mcp-for-nothing/commit/b5feebdd77cc3a61853ce2475df230f1407e20d3))
* add plugin UI with WebSocket connection interface ([32c9d01](https://github.com/drfarr/figma-mcp-for-nothing/commit/32c9d01042eb9b99d21dba6fb95cbd71da76756b))
* add plugin variable handlers ([3ba3840](https://github.com/drfarr/figma-mcp-for-nothing/commit/3ba3840574e3e38c3be822e927b1e759bf7e0460))
* add validNodeId validation helper ([0874e6f](https://github.com/drfarr/figma-mcp-for-nothing/commit/0874e6fe4b18999da9aceba5ad1d5cc09b5e3554))
* add viewport, styles, variables, components, annotations, fonts, reactions read tools ([d47bfa9](https://github.com/drfarr/figma-mcp-for-nothing/commit/d47bfa92a2c84550c1c9de5bdb039e218f98085f))
* complete get_design_context implementation in plugin code.js ([760a9cb](https://github.com/drfarr/figma-mcp-for-nothing/commit/760a9cb88fc41fa144bd33fa215b4bb80627eca1))
* consolidate plugin write handlers into code.js ([d175fb7](https://github.com/drfarr/figma-mcp-for-nothing/commit/d175fb76df97591b5d655800ce6e9f222c42bea5))
* create export tools module (save_screenshots, export_frames_to_pdf) ([f44b96a](https://github.com/drfarr/figma-mcp-for-nothing/commit/f44b96a0b701835ca3f9cc8de4547c611a41a39d))
* create MCP server entry point with Bridge initialization ([d5e3e4e](https://github.com/drfarr/figma-mcp-for-nothing/commit/d5e3e4e97efa949f6d831dd09842dbf5209fbcd3))
* create tool registry index aggregating all tool modules ([9d72fd0](https://github.com/drfarr/figma-mcp-for-nothing/commit/9d72fd062538d437a991432656c81ae198a8d82b))
* implement Bridge WebSocket server with connection management ([8ae129b](https://github.com/drfarr/figma-mcp-for-nothing/commit/8ae129b906b2e853313da43a609b809004442fb1))
* register basic read tools (get_document, get_metadata, get_pages, get_selection) ([1f1de5e](https://github.com/drfarr/figma-mcp-for-nothing/commit/1f1de5e9d2348067f77c1afe2e00a5e392a691b4))
* register MCP prompts (read_design_strategy, design_strategy, text_replacement_strategy) ([1632e77](https://github.com/drfarr/figma-mcp-for-nothing/commit/1632e775e772efa3b97a6d0c1998047cf5c430af))
* register write-component MCP tools ([9530604](https://github.com/drfarr/figma-mcp-for-nothing/commit/953060400d1d956d5a08cd60cf853272f0322f9e))
* register write-create MCP tools ([37d8dc1](https://github.com/drfarr/figma-mcp-for-nothing/commit/37d8dc1d3efcfe0e1fef7cf7eaea127a6f41ec2a))
* register write-modify MCP tools ([ebfde5f](https://github.com/drfarr/figma-mcp-for-nothing/commit/ebfde5f424f9543e06cb4d8c10b2ba2a6465d0da))
* register write-page MCP tools ([47bc0c0](https://github.com/drfarr/figma-mcp-for-nothing/commit/47bc0c0f38c15b2c8ec7173a75dad31772db9dc6))
* register write-prototype MCP tools ([27ad40d](https://github.com/drfarr/figma-mcp-for-nothing/commit/27ad40d4d230db8cc94ea105fdfc754d986554c2))
* register write-style, write-variable, write-prototype, write-page, write-component MCP tools ([70c47e3](https://github.com/drfarr/figma-mcp-for-nothing/commit/70c47e324d4a8d259c7438176c91bd59e3cfa7a8))
* register write-variable MCP tools ([95358b1](https://github.com/drfarr/figma-mcp-for-nothing/commit/95358b109bcd45243180a1f5da484f4def16a114))
* wire up tool registry and prompts to MCP server with graceful shutdown ([fcd90e3](https://github.com/drfarr/figma-mcp-for-nothing/commit/fcd90e3f173adc488f776cb2ca53c3677fe29a0e))


### Bug Fixes

* reorder import statements for consistency ([825f0b3](https://github.com/drfarr/figma-mcp-for-nothing/commit/825f0b39647a0b4fb290155f2f59b2c7fea4fd10))
