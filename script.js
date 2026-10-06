(function(){
  "use strict";

  /* ---------- constants (mm) ---------- */
  var MOD_DEPTH = 480;
  var CORPUS_H = 500;
  var TOP_VANITY_T = 30;
  var TOP_SIDEBOARD_T = 10;
  var GAP = 6;
  var LEG_PROFILE = 28;
  var MAX_MODULES = 4;
  var MAX_WIDTH = 3200;

  /* ---------- option data ---------- */
  // Bild-Texturen (optional): texture = Farbbild, normalMap / roughnessMap =
  // Struktur und Glanz, tile = wie viele mm ein Bild in der Realität abdeckt
  // (steuert die Wiederholung). Ohne texture (oder solange sie lädt) wird das
  // im Code erzeugte Muster in der Farbe hex verwendet.
  // Poliigon-Sets: <ordner>/<id>_BaseColor.png, _Normal.png, _Roughness.png
  function poliigon(folder, id){
    var p = 'textures/'+folder+'/'+id+'_';
    return {texture:p+'BaseColor.png', normalMap:p+'Normal.png', roughnessMap:p+'Roughness.png'};
  }
  // Sets im *_COL/_NRM/_ROUGHNESS_2K_METALNESS-Schema
  function metalnessSet(folder, id){
    var p = 'textures/'+folder+'/'+id+'_';
    return {texture:p+'COL_2K_METALNESS.png', normalMap:p+'NRM_2K_METALNESS.png', roughnessMap:p+'ROUGHNESS_2K_METALNESS.png'};
  }
  function withMaps(opt, maps){
    for(var k in maps){ opt[k] = maps[k]; }
    return opt;
  }

  var FRONTS = [
    withMaps({key:'eiche', name:'Eiche Furnier', hex:0xb0895c, rough:0.75, metal:0.0, tile:1000},
      poliigon('eiche', 'Poliigon_WoodVeneerOak_7760')),
    withMaps({key:'anthrazit', name:'Anthrazit matt', hex:0x3a3b3d, rough:0.8, metal:0.0, tile:600},
      poliigon('anthrazit-matt', 'Poliigon_PlasticMoldDryBlast_7495')),
    withMaps({key:'schwarz', name:'Schwarz Struktur', hex:0x202122, rough:0.6, metal:0.2, tile:600},
      poliigon('schwarz-struktur', 'Poliigon_MetalPaintedMatte_7037'))
  ];
  var TOPS = [
    withMaps({key:'beton', name:'Beton', hex:0xb9b8b2, rough:0.8, metal:0.0, tile:1500},
      poliigon('beton', 'Poliigon_ConcreteWorn_8690')),
    withMaps({key:'terrazzo-hell', name:'Terrazzo Hell', hex:0xe4e0da, rough:0.3, metal:0.0, tile:800},
      metalnessSet('terrazzo-hell', 'TerrazzoSlab018')),
    withMaps({key:'terrazzo-dunkel', name:'Terrazzo Dunkel', hex:0x2c2c2e, rough:0.25, metal:0.0, tile:1200},
      metalnessSet('terrazzo-dunkel', 'TerrazzoSlab028'))
  ];
  // Metall nur halb, da die Szene keine Umgebungsspiegelung hat (sonst fast schwarz)
  var HANDLES = [
    withMaps({key:'edelstahl', name:'Edelstahl', hex:0xacb0b0, rough:0.35, metal:0.5, tile:500},
      poliigon('edelstahl', 'Poliigon_MetalSteelBrushed_7174')),
    withMaps({key:'bronze', name:'Bronze', hex:0x8c6a45, rough:0.4, metal:0.5, tile:500},
      poliigon('bronze', 'Poliigon_MetalBronzeWorn_7248')),
    withMaps({key:'zink', name:'Zink', hex:0x9da3a6, rough:0.45, metal:0.5, tile:500},
      poliigon('zink', 'Poliigon_MetalGalvanizedZinc_7184'))
  ];
  var WALLS = [
    withMaps({key:'putz', name:'Putz', hex:0xece7da, rough:1, metal:0, tile:1500},
      poliigon('putz', 'Poliigon_PlasterPainted_7664')),
    withMaps({key:'backstein', name:'Backstein', hex:0x8a5a46, rough:1, metal:0, tile:2000},
      poliigon('backstein', 'Poliigon_BrickWallReclaimed_8320')),
    withMaps({key:'stampflehm', name:'Stampflehm', hex:0xb08e6c, rough:1, metal:0, tile:2000},
      metalnessSet('stampflehm', 'RammedEarth018'))
  ];
  var MIRROR_SMUDGES = 'textures/schlieren/SmudgesLarge001_OVERLAY_VAR1_2K.png';
  // model: mitgeliefertes glTF im Projektordner, size: Zielgrösse in mm (wird
  // proportional eingepasst), rotY: optionale Zusatzdrehung in Grad, falls die
  // automatische Ausrichtung nicht passt. hex/rough/metal gelten für die
  // einfache Ersatzgeometrie, solange das Modell lädt oder fehlt.
  var SINK_SHAPES = [
    {key:'round', name:'Kartell Rund', hex:0xcdb89a, rough:0.55, metal:0.02,
      model:'Sinks/sink2/scene.gltf', size:{w:400,h:150,d:400},
      credit:{title:'Laufen Kartell 17" Ceramic Bowl Bathroom Sink', author:'usbathstore', url:'https://sketchfab.com/3d-models/laufen-kartell-17-ceramic-bowl-bathroom-sink-2e45dbf71e0d45f9b0a53f27a5b2e48d'}},
    {key:'oval', name:'Eclipse Oval', hex:0x32353a, rough:0.4, metal:0.05,
      model:'Sinks/sink1/scene.gltf', size:{w:540,h:150,d:400},
      credit:{title:'Eclipse sink - Rock Design', author:'rockdesign.eu', url:'https://sketchfab.com/3d-models/eclipse-sink-rock-design-2bb40b5652a8475790f2ad8820ab2d67'}},
    {key:'rect', name:'Eckig', hex:0xf1efe8, rough:0.5, metal:0.02,
      model:'Sinks/bathroom_sink/scene.gltf', size:{w:560,h:150,d:400},
      credit:{title:'Bathroom Sink', author:'rickmaolly', url:'https://sketchfab.com/3d-models/bathroom-sink-96d6e3561a0e40779ff4a7086f9282a8'}}
  ];
  var FAUCET_TYPES = [
    {key:'round', name:'Klassisch', model:'Faucets/faucet2/scene.gltf', size:{w:200,h:260,d:220},
      credit:{title:'Bathroom Faucet', author:'Sristaps3D', url:'https://sketchfab.com/3d-models/bathroom-faucet-5458afa4a1a744f4a20152ae582bf5db'}},
    {key:'square', name:'Eckig', model:'Faucets/faucet1/scene.gltf', size:{w:200,h:260,d:220},
      credit:{title:'Free 3d Model Square bathroom faucet', author:'Deltahedra', url:'https://sketchfab.com/3d-models/free-3d-model-square-bathroom-faucet-a5c372a83f4f448e829fd2e4487ad75b'}},
    {key:'cylindrical', name:'Modern', model:'Faucets/faucet3/scene.gltf', size:{w:200,h:260,d:220},
      credit:{title:'Faucet modern', author:'eltayerkebulan', url:'https://sketchfab.com/3d-models/faucet-modern-45ab60ac857c4f56a53afe8992ed62d1'}}
  ];
  // 'original': glTF-Armaturen behalten ihre eigenen Materialien/Texturen
  // (die Werte gelten nur für die einfache Ersatzgeometrie).
  var FAUCET_FINISHES = [
    {key:'original', name:'Original', hex:0xc4c8c9, rough:0.15, metal:1},
    {key:'chrome', name:'Chrom', hex:0xd2d6d7, rough:0.12, metal:1},
    {key:'blackmatt', name:'Schwarz matt', hex:0x232528, rough:0.5, metal:0.6},
    {key:'steel', name:'Edelstahl', hex:0xacb0b0, rough:0.3, metal:0.9}
  ];

  function findOpt(list, key){
    for (var i=0;i<list.length;i++){ if(list[i].key===key) return list[i]; }
    return list[0];
  }

  /* ---------- pricing (example net prices, CHF, excl. VAT) ---------- */
  var PRICE = {
    moduleBase: { vanity:{600:480, 800:620}, sideboard:{600:390, 800:510} },
    frontSurcharge: {eiche:40, anthrazit:0, schwarz:60},
    topPerMeter: {beton:0, 'terrazzo-hell':180, 'terrazzo-dunkel':220},
    handleSurcharge: {edelstahl:0, bronze:25, zink:15},
    sink: {round:180, oval:220, rect:240},
    faucetType: {round:140, square:160, cylindrical:190},
    faucetFinish: {original:0, chrome:0, blackmatt:30, steel:45},
    frameSurcharge: {140:0, 240:60},
    install: 190
  };
  function formatCHF(n){
    try{
      return new Intl.NumberFormat('de-CH', {style:'currency', currency:'CHF', maximumFractionDigits:0}).format(n);
    }catch(e){
      return 'CHF ' + Math.round(n);
    }
  }
  function computePrice(){
    var rows = [];
    var total = 0;
    var totalW = moduleTotalWidth(state.modules);
    var base = PRICE.moduleBase[state.type];
    state.modules.forEach(function(m, i){
      var b = base[m.width] || 0;
      var f = PRICE.frontSurcharge[state.front] || 0;
      var h = PRICE.handleSurcharge[state.handle] || 0;
      var sub = b + f + h;
      total += sub;
      rows.push(['Modul '+(i+1)+' ('+m.width+' mm)', sub]);
      if(state.type==='vanity' && m.sink){
        var sinkPrice = PRICE.sink[m.shape] || 0;
        var faucetPrice = (PRICE.faucetType[state.faucetType]||0) + (PRICE.faucetFinish[state.faucetFinish]||0);
        total += sinkPrice + faucetPrice;
        rows.push(['— Becken '+findOpt(SINK_SHAPES, m.shape).name, sinkPrice]);
        rows.push(['— Armatur '+findOpt(FAUCET_TYPES, state.faucetType).name, faucetPrice]);
      }
    });
    if(state.type==='vanity'){
      var topSur = (PRICE.topPerMeter[state.top] || 0) * (totalW/1000);
      total += topSur;
      rows.push(['Arbeitsplatte '+findOpt(TOPS, state.top).name, topSur]);
    } else {
      var frameSur = PRICE.frameSurcharge[state.frameHeight] || 0;
      total += frameSur;
      rows.push(['Gestell '+state.frameHeight+' mm', frameSur]);
    }
    if(state.install){
      total += PRICE.install;
      rows.push(['Montageservice', PRICE.install]);
    }
    return {rows:rows, total:total};
  }
  function updatePrice(){
    var res = computePrice();
    var list = document.getElementById('priceList');
    if(!list) return;
    list.innerHTML = res.rows.map(function(r){
      return '<dt>'+r[0]+'</dt><dd>'+formatCHF(r[1])+'</dd>';
    }).join('');
    document.getElementById('priceTotal').textContent = formatCHF(res.total);
  }

  /* ---------- state ---------- */
  var state = {
    type: 'vanity',
    modules: [
      {width:800, sink:true, shape:'oval'},
      {width:800, sink:false, shape:'round'}
    ],
    mountHeight: 650,
    frameHeight: 140,
    front: 'eiche',
    top: 'beton',
    handle: 'edelstahl',
    wall: 'putz',
    faucetType: 'cylindrical',
    faucetFinish: 'original',
    variants: {},   // Modell-Slot-ID -> gewählte Ausführung (Index, -1 = Standard)
    mirror: true,
    install: false
  };

  /* ---------- three.js setup ---------- */
  var viewport = document.getElementById('viewport');
  var canvas = document.getElementById('scene');
  var renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding !== undefined ? THREE.sRGBEncoding : renderer.outputEncoding;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(32, 1, 1, 20000);

  var furnitureGroup = new THREE.Group();
  var envGroup = new THREE.Group();
  scene.add(furnitureGroup);
  scene.add(envGroup);

  var hemi = new THREE.HemisphereLight(0xffffff, 0x33362f, 0.75);
  scene.add(hemi);
  var key = new THREE.DirectionalLight(0xfff3e0, 1.05);
  key.position.set(1400, 2600, 1600);
  key.castShadow = true;
  key.shadow.mapSize.set(2048,2048);
  key.shadow.camera.left = -2200;
  key.shadow.camera.right = 2200;
  key.shadow.camera.top = 2200;
  key.shadow.camera.bottom = -2200;
  key.shadow.camera.near = 100;
  key.shadow.camera.far = 6000;
  key.shadow.bias = -0.0009;
  scene.add(key);
  var fill = new THREE.DirectionalLight(0xdfe8ff, 0.35);
  fill.position.set(-1600, 1200, -1200);
  scene.add(fill);

  var floorMat = new THREE.MeshStandardMaterial({color:0xe7e3d8, roughness:1, metalness:0});
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(9000,9000), floorMat);
  floor.rotation.x = -Math.PI/2;
  floor.receiveShadow = true;
  envGroup.add(floor);

  var wallMat = new THREE.MeshStandardMaterial({color:0xece7da, roughness:1, metalness:0});
  var wall = new THREE.Mesh(new THREE.PlaneGeometry(6000,3400), wallMat);
  wall.position.set(0, 1700, -MOD_DEPTH/2 - 6);
  wall.receiveShadow = true;
  envGroup.add(wall);

  var mirrorGroupMesh = new THREE.Group();
  var mirrorGlass = new THREE.Mesh(
    new THREE.CircleGeometry(1, 48),
    new THREE.MeshStandardMaterial({color:0xcfd8d6, roughness:0.05, metalness:0.6, envMapIntensity:1})
  );
  var mirrorRing = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.04, 16, 48),
    new THREE.MeshStandardMaterial({color:0xfff2d6, emissive:0xffdca0, emissiveIntensity:0.9, roughness:0.4})
  );
  mirrorRing.rotation.x = 0;
  mirrorGroupMesh.add(mirrorGlass);
  mirrorGroupMesh.add(mirrorRing);
  mirrorGroupMesh.rotation.x = 0;
  envGroup.add(mirrorGroupMesh);

  /* ---------- camera orbit (custom, no external deps) ---------- */
  var target = new THREE.Vector3(0, 700, 0);
  var camAzimuth = Math.PI*0.22;
  var camElevation = 0.36;
  var camRadius = 2600;
  var camRadiusDefault = 2600;
  var camAzimuthDefault = camAzimuth;
  var camElevationDefault = camElevation;

  function updateCamera(){
    var r = camRadius;
    camera.position.x = target.x + r*Math.cos(camElevation)*Math.sin(camAzimuth);
    camera.position.z = target.z + r*Math.cos(camElevation)*Math.cos(camAzimuth);
    camera.position.y = target.y + r*Math.sin(camElevation);
    camera.lookAt(target);
  }

  var dragging = false, lastX=0, lastY=0;
  canvas.addEventListener('pointerdown', function(e){
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', function(e){
    if(!dragging) return;
    var dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    camAzimuth -= dx*0.0055;
    camElevation = Math.min(1.45, Math.max(0.06, camElevation - dy*0.0055));
    updateCamera();
  });
  canvas.addEventListener('pointerup', function(e){ dragging=false; });
  canvas.addEventListener('pointercancel', function(){ dragging=false; });
  canvas.addEventListener('wheel', function(e){
    e.preventDefault();
    camRadius *= (1 + e.deltaY*0.0012);
    camRadius = Math.min(6500, Math.max(700, camRadius));
    updateCamera();
  }, {passive:false});

  document.getElementById('resetView').addEventListener('click', function(){
    camAzimuth = camAzimuthDefault;
    camElevation = camElevationDefault;
    camRadius = camRadiusDefault;
    updateCamera();
  });

  /* ---------- theme handling ---------- */
  function currentTheme(){
    var t = document.documentElement.getAttribute('data-theme');
    if(t==='dark' || t==='light') return t;
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }
  function applyTheme(){
    var dark = currentTheme()==='dark';
    scene.background = new THREE.Color(dark ? 0x13170f : 0xeef0ee);
    scene.fog = new THREE.Fog(scene.background.getHex(), 2600, 7500);
    floorMat.color.set(dark ? 0x1c211d : 0xe7e3d8);
    updateWall();
    hemi.intensity = dark ? 0.5 : 0.75;
    key.intensity = dark ? 0.85 : 1.05;
  }
  if(window.matchMedia){
    try{
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
    }catch(e){}
  }
  try{
    new MutationObserver(applyTheme).observe(document.documentElement, {attributes:true, attributeFilter:['data-theme']});
  }catch(e){}

  /* ---------- geometry helpers ---------- */
  function mat(opt, extra){
    var params = {color:opt.hex, roughness:opt.rough, metalness:opt.metal};
    if(extra) for(var k in extra) params[k]=extra[k];
    return new THREE.MeshStandardMaterial(params);
  }
  function box(w,h,d,material){
    var m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  /* ---------- procedural textures (canvas-generated, no external images) ---------- */
  var textureCache = {};
  function hexToRgb(hex){ return { r:(hex>>16)&255, g:(hex>>8)&255, b:hex&255 }; }
  function clamp255(v){ return v<0?0:(v>255?255:v); }
  function shadeRgb(rgb, amt){ return { r:clamp255(rgb.r+amt), g:clamp255(rgb.g+amt), b:clamp255(rgb.b+amt) }; }
  function rgbCss(rgb){ return 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')'; }
  function rgbaCss(rgb,a){ return 'rgba('+rgb.r+','+rgb.g+','+rgb.b+','+a+')'; }
  function rnd(min,max){ return min + Math.random()*(max-min); }

  function drawSpeckle(ctx, size, base, count, minR, maxR, alphaMax){
    for(var i=0;i<count;i++){
      var x=rnd(0,size), y=rnd(0,size), r=rnd(minR,maxR);
      var amt = (Math.random()>0.5 ? 1 : -1) * rnd(10,55);
      ctx.fillStyle = rgbaCss(shadeRgb(base,amt), rnd(0.12, alphaMax));
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    }
  }
  function drawPores(ctx, size, base, count){
    for(var i=0;i<count;i++){
      var x=rnd(0,size), y=rnd(0,size), r=rnd(1.5,4.5);
      var grad = ctx.createRadialGradient(x,y,0,x,y,r);
      grad.addColorStop(0, rgbaCss(shadeRgb(base,-70), 0.6));
      grad.addColorStop(1, rgbaCss(shadeRgb(base,-70), 0));
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    }
  }
  function toGrayCanvas(src){
    var g = document.createElement('canvas');
    g.width = src.width; g.height = src.height;
    var gctx = g.getContext('2d');
    gctx.drawImage(src,0,0);
    var id = gctx.getImageData(0,0,g.width,g.height);
    var d = id.data;
    for(var i=0;i<d.length;i+=4){
      var lum = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
      d[i]=d[i+1]=d[i+2]=lum;
    }
    gctx.putImageData(id,0,0);
    return g;
  }

  function buildTexturePack(kind, hex){
    var size = 512;
    var c = document.createElement('canvas');
    c.width = size; c.height = size;
    var ctx = c.getContext('2d');
    var base = hexToRgb(hex);
    ctx.fillStyle = rgbCss(base);
    ctx.fillRect(0,0,size,size);
    var bumpScale = 0.15;

    if(kind==='wood'){
      bumpScale = 0.55;
      for(var i=0;i<170;i++){
        var y0 = rnd(0,size);
        var amt = rnd(-32,32);
        ctx.strokeStyle = rgbaCss(shadeRgb(base,amt), rnd(0.12,0.32));
        ctx.lineWidth = rnd(0.6,2.2);
        ctx.beginPath();
        var yy = y0;
        ctx.moveTo(0,yy);
        for(var x=0;x<=size;x+=28){ yy += rnd(-6,6); ctx.lineTo(x,yy); }
        ctx.stroke();
      }
      for(var k=0;k<3;k++){
        var kx=rnd(0,size), ky=rnd(0,size), kr=rnd(10,22);
        var grad=ctx.createRadialGradient(kx,ky,1,kx,ky,kr);
        grad.addColorStop(0, rgbaCss(shadeRgb(base,-55),0.45));
        grad.addColorStop(1, rgbaCss(shadeRgb(base,-55),0));
        ctx.fillStyle=grad;
        ctx.beginPath(); ctx.ellipse(kx,ky,kr,kr*0.5,rnd(0,Math.PI),0,Math.PI*2); ctx.fill();
      }
    } else if(kind==='matte'){
      bumpScale = 0.06;
      var id = ctx.getImageData(0,0,size,size);
      var d = id.data;
      for(var p=0;p<d.length;p+=4){
        var n = rnd(-7,7);
        d[p]=clamp255(d[p]+n); d[p+1]=clamp255(d[p+1]+n); d[p+2]=clamp255(d[p+2]+n);
      }
      ctx.putImageData(id,0,0);
    } else if(kind==='stone-fine'){
      bumpScale = 0.16;
      drawSpeckle(ctx, size, base, 2600, 0.8, 2.6, 0.5);
    } else if(kind==='travertine'){
      bumpScale = 0.6;
      for(var b=0;b<10;b++){
        var by=rnd(0,size);
        ctx.fillStyle=rgbaCss(shadeRgb(base, rnd(-18,14)), 0.16);
        ctx.fillRect(0,by,size, rnd(8,26));
      }
      drawSpeckle(ctx, size, base, 900, 1, 5, 0.5);
      drawPores(ctx, size, base, 110);
    } else if(kind==='darkstone'){
      bumpScale = 0.2;
      drawSpeckle(ctx, size, base, 2200, 0.8, 2.6, 0.45);
    } else if(kind==='fleck-white'){
      bumpScale = 0.14;
      drawSpeckle(ctx, size, base, 1500, 0.8, 2.2, 0.35);
    } else if(kind==='brushed' || kind==='brushed-dark'){
      bumpScale = 0.05;
      for(var l=0;l<size;l+=1){
        var amt2 = rnd(-16,16);
        ctx.strokeStyle = rgbaCss(shadeRgb(base,amt2), rnd(0.05,0.18));
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, l+rnd(-0.4,0.4));
        ctx.lineTo(size, l+rnd(-0.4,0.4));
        ctx.stroke();
      }
    }

    var mapTex = new THREE.CanvasTexture(c);
    mapTex.wrapS = mapTex.wrapT = THREE.RepeatWrapping;
    var bumpTex = new THREE.CanvasTexture(toGrayCanvas(c));
    bumpTex.wrapS = bumpTex.wrapT = THREE.RepeatWrapping;
    return { map:mapTex, bump:bumpTex, bumpScale:bumpScale };
  }

  function getTexturePack(kind, hex){
    var key = kind+'_'+hex;
    if(!textureCache[key]) textureCache[key] = buildTexturePack(kind, hex);
    return textureCache[key];
  }

  /* ---------- Bild-Texturen aus dem Projektordner ---------- */
  // url -> THREE.Texture | 'loading' | 'failed'
  var imageTextures = {};
  var textureLoader = new THREE.TextureLoader();

  // isColor: Farbbilder sind sRGB, Normal-/Roughness-Maps lineare Daten.
  // onLoad (optional) statt rebuildScene, z. B. für Wand und Spiegel.
  function getImageTexture(url, isColor, onLoad){
    var t = imageTextures[url];
    if(t && typeof t === 'object') return t;
    if(!t){
      imageTextures[url] = 'loading';
      textureLoader.load(url, function(tex){
        if(isColor) tex.encoding = THREE.sRGBEncoding;
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        imageTextures[url] = tex;
        (onLoad || rebuildScene)(tex);
      }, undefined, function(){
        imageTextures[url] = 'failed';
        console.warn('Textur nicht gefunden, verwende erzeugtes Muster: '+url);
      });
    }
    return null;
  }

  // sizeMm (optional): {w,h} der Fläche in mm – nötig, damit eine Bild-Textur
  // im richtigen Massstab wiederholt wird.
  function texMat(kind, opt, repX, repY, sizeMm){
    var img = (opt.texture && sizeMm) ? getImageTexture(opt.texture, true) : null;
    if(img){
      var tile = opt.tile || 600;
      var rep = function(t){
        if(!t) return null;
        var c = t.clone(); c.needsUpdate = true;
        c.repeat.set(sizeMm.w/tile, sizeMm.h/tile);
        return c;
      };
      var nrm = opt.normalMap ? getImageTexture(opt.normalMap) : null;
      var rgh = opt.roughnessMap ? getImageTexture(opt.roughnessMap) : null;
      return new THREE.MeshStandardMaterial({
        map: rep(img), normalMap: rep(nrm), roughnessMap: rep(rgh),
        roughness: rgh ? 1 : opt.rough, metalness: opt.metal, color: 0xffffff
      });
    }
    var pack = getTexturePack(kind, opt.hex);
    var map = pack.map.clone(); map.needsUpdate = true;
    map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(repX, repY);
    var bump = pack.bump.clone(); bump.needsUpdate = true;
    bump.wrapS = bump.wrapT = THREE.RepeatWrapping; bump.repeat.set(repX, repY);
    return new THREE.MeshStandardMaterial({
      map: map, bumpMap: bump, bumpScale: pack.bumpScale,
      roughness: opt.rough, metalness: opt.metal, color: 0xffffff
    });
  }
  function frontKindFor(key){ return key==='eiche' ? 'wood' : 'matte'; }

  /* ---------- custom 3D models (Becken / Armatur / Griffleiste) ---------- */
  var MODEL_SLOTS = [
    {id:'sink_round', group:'sink', variant:'round', label:'Becken – Kartell Rund', target:{w:500,h:150,d:400}, origin:'bottom'},
    {id:'sink_oval', group:'sink', variant:'oval', label:'Becken – Eclipse Oval', target:{w:560,h:150,d:400}, origin:'bottom'},
    {id:'sink_rect', group:'sink', variant:'rect', label:'Becken – Eckig', target:{w:560,h:150,d:380}, origin:'bottom'},
    {id:'faucet_round', group:'faucet', variant:'round', label:'Armatur – Klassisch', target:{w:200,h:260,d:220}, origin:'bottom'},
    {id:'faucet_square', group:'faucet', variant:'square', label:'Armatur – Eckig', target:{w:200,h:260,d:220}, origin:'bottom'},
    {id:'faucet_cylindrical', group:'faucet', variant:'cylindrical', label:'Armatur – Modern', target:{w:200,h:260,d:220}, origin:'bottom'},
    {id:'handle', group:'handle', variant:null, label:'Griffleiste', target:{h:16,d:22}, origin:'center'}
  ];
  var customModels = {
    sink:{round:null, oval:null, rect:null},
    faucet:{round:null, square:null, cylindrical:null},
    handle:null
  };
  function findSlot(id){ for(var i=0;i<MODEL_SLOTS.length;i++){ if(MODEL_SLOTS[i].id===id) return MODEL_SLOTS[i]; } return null; }
  function getSlotValue(slot){ return slot.group==='handle' ? customModels.handle : customModels[slot.group][slot.variant]; }
  function setSlotValue(slot, val){ if(slot.group==='handle'){ customModels.handle = val; } else { customModels[slot.group][slot.variant] = val; } }

  var gltfLoader = (typeof THREE.GLTFLoader === 'function') ? new THREE.GLTFLoader() : null;

  // anchor (optional): Punkt in x/z, der zum Ursprung wird (statt Box-Mitte).
  function fitModelTemplate(scene3d, target, originMode, anchor){
    var box3 = new THREE.Box3().setFromObject(scene3d);
    var size = new THREE.Vector3(); box3.getSize(size);
    var center = new THREE.Vector3(); box3.getCenter(center);
    scene3d.position.x -= anchor ? anchor.x : center.x;
    scene3d.position.z -= anchor ? anchor.z : center.z;
    scene3d.position.y -= (originMode==='center') ? center.y : box3.min.y;
    scene3d.traverse(function(o){ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } });
    var wrapper = new THREE.Group();
    wrapper.add(scene3d);
    var fit = { natural: size.clone(), target: target };
    if(originMode!=='center'){
      var sx = size.x>0 ? target.w/size.x : 1;
      var sy = size.y>0 ? target.h/size.y : 1;
      var sz = size.z>0 ? target.d/size.z : 1;
      var s = Math.min(sx,sy,sz);
      fit.baseScale = (isFinite(s) && s>0) ? s : 1;
    }
    wrapper.userData.fit = fit;
    return wrapper;
  }

  // Mittelpunkt (x/z) aller Vertices unterhalb maxY – bei einer Armatur die
  // Grundplatte, von der aus der Auslauf nach vorne zeigt.
  function footCentroid(root, maxY){
    var v = new THREE.Vector3(), sx = 0, sz = 0, n = 0;
    root.traverse(function(o){
      if(!o.isMesh) return;
      var pos = o.geometry.attributes.position;
      var step = Math.max(1, Math.floor(pos.count/20000));
      for(var i=0;i<pos.count;i+=step){
        v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
        if(v.y <= maxY){ sx += v.x; sz += v.z; n++; }
      }
    });
    return n ? new THREE.Vector3(sx/n, 0, sz/n) : null;
  }

  // Dreht ein Modell passend zum Möbel: Becken mit der langen Seite entlang x,
  // Armatur mit dem Auslauf nach vorne (+z). Gibt bei Armaturen den Fusspunkt
  // zurück, damit sie an der Grundplatte statt an der Box-Mitte sitzt.
  function orientModel(pivot, group, extraRotYDeg){
    pivot.updateMatrixWorld(true);
    var box3 = new THREE.Box3().setFromObject(pivot);
    var size = new THREE.Vector3(); box3.getSize(size);
    var center = new THREE.Vector3(); box3.getCenter(center);
    var angle = 0, foot = null;
    if(group==='faucet'){
      foot = footCentroid(pivot, box3.min.y + size.y*0.08);
      var dx = foot ? center.x - foot.x : 0, dz = foot ? center.z - foot.z : 0;
      if(Math.sqrt(dx*dx + dz*dz) > 0.05*Math.max(size.x, size.z)){
        angle = -Math.atan2(dx, dz);
      } else if(size.x > size.z){
        angle = Math.PI/2;
      }
    } else if(size.z > size.x){
      angle = Math.PI/2;
    }
    angle = Math.round(angle/(Math.PI/2))*(Math.PI/2) + (extraRotYDeg||0)*Math.PI/180;
    pivot.rotation.y = angle;
    pivot.updateMatrixWorld(true);
    if(foot) foot.applyAxisAngle(new THREE.Vector3(0,1,0), angle);
    return foot;
  }

  function prepareModel(scene3d, slot, target, extraRotYDeg){
    if(slot.group==='handle') return fitModelTemplate(scene3d, slot.target, slot.origin);
    var pivot = new THREE.Group();
    pivot.add(scene3d);
    var foot = orientModel(pivot, slot.group, extraRotYDeg);
    return fitModelTemplate(pivot, target || slot.target, slot.origin, foot);
  }

  /* ---------- mitgelieferte Modelle aus den Projektordnern ---------- */
  // Wert je Variante: Eintrag wie bei customModels, 'loading' oder 'failed'.
  // Geladen wird erst, wenn eine Variante gebraucht wird; bis dahin (oder wenn
  // die Datei fehlt) zeigt die Szene die einfache Ersatzgeometrie.
  var builtinModels = { sink:{}, faucet:{} };

  function resolveModel(group, key){
    if(customModels[group][key]) return customModels[group][key];
    var b = builtinModels[group][key];
    if(b && typeof b === 'object') return b;
    if(!b) loadBuiltinModel(group, key);
    return null;
  }

  function loadBuiltinModel(group, key){
    var opt = findOpt(group==='sink' ? SINK_SHAPES : FAUCET_TYPES, key);
    var slot = findSlot(group+'_'+key);
    if(!opt.model || !gltfLoader || !slot){ builtinModels[group][key] = 'failed'; return; }
    builtinModels[group][key] = 'loading';
    renderModelSlots();
    gltfLoader.load(opt.model, function(gltf){
      var wrapper = prepareModel(gltf.scene, slot, opt.size, opt.rotY);
      var entry = { name:opt.model, object:wrapper, scale:1 };
      builtinModels[group][key] = entry;
      renderModelSlots();
      rebuildScene();
      attachVariants(entry, gltf);
    }, undefined, function(err){
      builtinModels[group][key] = 'failed';
      renderModelSlots();
      console.warn('3D-Modell konnte nicht geladen werden: '+opt.model, err);
    });
  }

  // Liest die Material-Ausführungen einer glTF-Datei (KHR_materials_variants)
  // und hängt sie an den Modell-Eintrag: names = Liste der Ausführungen,
  // byGeometry = Geometrie -> [Material je Ausführung].
  function attachVariants(entry, gltf){
    var parser = gltf.parser, json = parser.json;
    var ext = json.extensions && json.extensions.KHR_materials_variants;
    if(!ext || !ext.variants || !ext.variants.length) return Promise.resolve();
    var byGeometry = new Map();
    var jobs = [];
    (json.meshes||[]).forEach(function(meshDef, mi){
      meshDef.primitives.forEach(function(prim, pi){
        var pe = prim.extensions && prim.extensions.KHR_materials_variants;
        if(!pe || !pe.mappings) return;
        jobs.push(parser.getDependency('mesh', mi).then(function(obj){
          var target = obj.isMesh ? obj : obj.children[pi];
          if(!target || !target.geometry) return;
          return Promise.all(pe.mappings.map(function(mp){
            return parser.getDependency('material', mp.material).then(function(mat){
              var list = byGeometry.get(target.geometry) || [];
              mp.variants.forEach(function(v){ list[v] = mat; });
              byGeometry.set(target.geometry, list);
            });
          }));
        }));
      });
    });
    return Promise.all(jobs).then(function(){
      entry.variants = {
        names: ext.variants.map(function(v, i){ return v.name || ('Ausführung '+(i+1)); }),
        byGeometry: byGeometry
      };
      rebuildScene();
    }).catch(function(err){ console.warn('Ausführungen konnten nicht gelesen werden', err); });
  }

  function applyVariant(inst, entry, slotId){
    var idx = state.variants[slotId];
    if(!entry.variants || idx === undefined || idx < 0) return;
    inst.traverse(function(o){
      if(!o.isMesh) return;
      var list = entry.variants.byGeometry.get(o.geometry);
      if(list && list[idx]) o.material = list[idx];
    });
  }

  // Auswahl der Ausführungen für alle aktuell sichtbaren Modelle, die welche haben.
  function renderVariantPicker(){
    var group = document.getElementById('variantGroup');
    var list = document.getElementById('variantList');
    if(!group || !list) return;
    var used = [];
    if(state.type==='vanity'){
      var shapes = {};
      state.modules.forEach(function(m){ if(m.sink) shapes[m.shape] = true; });
      Object.keys(shapes).forEach(function(k){ used.push(findSlot('sink_'+k)); });
      if(used.length) used.push(findSlot('faucet_'+state.faucetType));
    }
    var rows = used.map(function(slot){
      var entry = customModels[slot.group][slot.variant] || builtinModels[slot.group][slot.variant];
      if(!entry || typeof entry !== 'object' || !entry.variants) return '';
      var cur = state.variants[slot.id];
      if(cur === undefined) cur = -1;
      var opts = '<option value="-1">Standard</option>' + entry.variants.names.map(function(n, i){
        return '<option value="'+i+'"'+(cur===i?' selected':'')+'>'+n+'</option>';
      }).join('');
      return '<label class="variant-row"><span>'+slot.label+'</span>'+
        '<select class="sink-shape" data-slot="'+slot.id+'">'+opts+'</select></label>';
    }).join('');
    list.innerHTML = rows;
    group.hidden = !rows;
  }

  (function wireVariantPicker(){
    var list = document.getElementById('variantList');
    if(!list) return;
    list.addEventListener('change', function(e){
      var slotId = e.target.getAttribute('data-slot');
      if(!slotId) return;
      state.variants[slotId] = parseInt(e.target.value, 10);
      rebuildScene();
    });
  })();

  // Ersetzt die Materialien eines Armatur-Modells durch die gewählte Oberfläche.
  function applyFaucetFinish(obj, finish){
    obj.traverse(function(o){
      if(!o.isMesh) return;
      var src = Array.isArray(o.material) ? o.material[0] : o.material;
      o.material = new THREE.MeshStandardMaterial({
        color: finish.hex, metalness: finish.metal, roughness: finish.rough,
        normalMap: (src && src.normalMap) || null
      });
    });
  }

  function renderModelCredits(){
    var el = document.getElementById('modelCredits');
    if(!el) return;
    var items = SINK_SHAPES.concat(FAUCET_TYPES).filter(function(o){ return o.credit; });
    el.innerHTML = '3D-Modelle (CC BY 4.0, Sketchfab): ' + items.map(function(o){
      return '<a href="'+o.credit.url+'" target="_blank" rel="noopener">'+o.credit.title+'</a> von '+o.credit.author;
    }).join(' · ');
  }

  function instantiateModel(entry, opts){
    opts = opts || {};
    var clone = entry.object.clone(true);
    var fit = entry.object.userData.fit;
    var extra = entry.scale || 1;
    if(fit.baseScale !== undefined){
      clone.scale.setScalar(fit.baseScale * extra);
    } else {
      var sYZ = Math.min(fit.target.h/(fit.natural.y||1), fit.target.d/(fit.natural.z||1)) || 1;
      var sX = opts.width ? (opts.width/(fit.natural.x||1)) : sYZ;
      clone.scale.set(sX*extra, sYZ*extra, sYZ*extra);
    }
    return clone;
  }

  function arrayBufferToBase64(buf){
    var bytes = new Uint8Array(buf);
    var chunk = 0x8000;
    var parts = [];
    for(var i=0;i<bytes.length;i+=chunk){ parts.push(String.fromCharCode.apply(null, bytes.subarray(i, i+chunk))); }
    return btoa(parts.join(''));
  }
  function base64ToArrayBuffer(b64){
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for(var i=0;i<bin.length;i++){ bytes[i] = bin.charCodeAt(i); }
    return bytes.buffer;
  }

  function parseGltfData(data){
    return new Promise(function(resolve, reject){
      if(!gltfLoader){ reject({code:'no_loader'}); return; }
      gltfLoader.parse(data, '', function(gltf){ resolve(gltf); }, function(err){ reject(err); });
    });
  }

  function renderModelSlots(){
    var wrap = document.getElementById('modelSlots');
    if(!wrap) return;
    wrap.innerHTML = MODEL_SLOTS.map(function(slot){
      var entry = getSlotValue(slot);
      var builtin = slot.group==='handle' ? null : builtinModels[slot.group][slot.variant];
      var status = entry
        ? ('Eigenes Modell: '+entry.name+(entry.persisted===false ? ' (nur diese Sitzung)' : ''))
        : (builtin && typeof builtin === 'object') ? 'Mitgeliefert: '+builtin.name
        : builtin==='loading' ? 'Mitgeliefertes Modell lädt …'
        : builtin==='failed' ? 'Modell nicht gefunden – Standard-Geometrie'
        : 'Standard-Geometrie';
      return '<div class="model-row">'+
        '<div class="model-row-head"><span class="model-label">'+slot.label+'</span>'+
        '<span class="model-status'+(entry?' active':'')+'">'+status+'</span></div>'+
        '<div class="model-row-controls">'+
          '<label class="file-btn">Datei wählen<input type="file" accept=".glb,.gltf" data-slot="'+slot.id+'" hidden></label>'+
          (entry ? '<input type="range" class="model-scale" data-slot="'+slot.id+'" min="0.5" max="2" step="0.05" value="'+entry.scale+'" title="Skalierung">' : '')+
          (entry ? '<button type="button" class="model-remove" data-slot="'+slot.id+'" title="Entfernen">&#10005;</button>' : '')+
        '</div>'+
      '</div>';
    }).join('');
  }

  async function handleModelFile(slotId, file){
    var slot = findSlot(slotId);
    if(!slot || !file) return;
    if(!/\.(glb|gltf)$/i.test(file.name)){
      alert('Bitte eine .glb- oder .gltf-Datei wählen.');
      return;
    }
    if(!gltfLoader){
      alert('3D-Loader konnte nicht geladen werden. Bitte Seite neu laden und erneut versuchen.');
      return;
    }
    try{
      var buf = await file.arrayBuffer();
      var isGlb = /\.glb$/i.test(file.name);
      var parseInput = isGlb ? buf : new TextDecoder('utf-8').decode(buf);
      var gltf = await parseGltfData(parseInput);
      var wrapper = prepareModel(gltf.scene, slot);
      var entry = { name:file.name, object:wrapper, scale:1, persisted:false };
      setSlotValue(slot, entry);
      renderModelSlots();
      rebuildScene();
      attachVariants(entry, gltf);

      if(buf.byteLength <= 3*1024*1024){
        try{
          localStorage.setItem('vanova3d_'+slot.id, JSON.stringify({name:file.name, isGlb:isGlb, data:arrayBufferToBase64(buf)}));
          entry.persisted = true;
          renderModelSlots();
        }catch(e){ /* quota exceeded or storage unavailable – keep session-only */ }
      }
    }catch(err){
      alert('Datei konnte nicht geladen werden. Bitte als eingebettetes (self-contained) glTF/GLB ohne Kompressions-Erweiterungen exportieren.');
    }
  }

  function clearModelSlot(slotId){
    var slot = findSlot(slotId);
    if(!slot) return;
    setSlotValue(slot, null);
    try{ localStorage.removeItem('vanova3d_'+slot.id); }catch(e){}
    renderModelSlots();
    rebuildScene();
  }

  function restoreCustomModelsFromStorage(){
    if(!gltfLoader) return;
    MODEL_SLOTS.forEach(function(slot){
      var raw;
      try{ raw = localStorage.getItem('vanova3d_'+slot.id); }catch(e){ raw = null; }
      if(!raw) return;
      try{
        var parsed = JSON.parse(raw);
        var buf = base64ToArrayBuffer(parsed.data);
        var parseInput = parsed.isGlb ? buf : new TextDecoder('utf-8').decode(buf);
        parseGltfData(parseInput).then(function(gltf){
          var wrapper = prepareModel(gltf.scene, slot);
          var entry = {name:parsed.name, object:wrapper, scale:1, persisted:true};
          setSlotValue(slot, entry);
          renderModelSlots();
          rebuildScene();
          attachVariants(entry, gltf);
        }).catch(function(){
          try{ localStorage.removeItem('vanova3d_'+slot.id); }catch(e){}
        });
      }catch(e){
        try{ localStorage.removeItem('vanova3d_'+slot.id); }catch(e2){}
      }
    });
  }

  (function wireModelAdmin(){
    var wrap = document.getElementById('modelSlots');
    if(!wrap) return;
    wrap.addEventListener('change', function(e){
      if(e.target.matches('input[type="file"]')){
        var slotId = e.target.getAttribute('data-slot');
        var file = e.target.files && e.target.files[0];
        handleModelFile(slotId, file);
      } else if(e.target.matches('.model-scale')){
        var sId = e.target.getAttribute('data-slot');
        var s = findSlot(sId);
        var entry = s ? getSlotValue(s) : null;
        if(entry){ entry.scale = parseFloat(e.target.value); rebuildScene(); }
      }
    });
    wrap.addEventListener('click', function(e){
      var btn = e.target.closest('.model-remove');
      if(!btn) return;
      clearModelSlot(btn.getAttribute('data-slot'));
    });
  })();

  function buildFaucet(group, x, zBase, finish){
    // zBase: position of the faucet column, close to the wall; the spout
    // extends toward +z (forward, over the basin).
    var fmat = texMat('brushed', finish, 1, 3);
    var typeOpt = state.faucetType;
    var base = box(34,10,34, fmat);
    base.position.set(x, 0, zBase);
    group.add(base);
    if(typeOpt==='round'){
      var col = new THREE.Mesh(new THREE.CylinderGeometry(9,9,150,20), fmat);
      col.position.set(x, 75, zBase);
      col.castShadow=true;
      group.add(col);
      var spout = new THREE.Mesh(new THREE.CylinderGeometry(7,7,90,16), fmat);
      spout.rotation.x = Math.PI/2;
      spout.position.set(x, 150, zBase+45);
      spout.castShadow=true;
      group.add(spout);
      var tip = new THREE.Mesh(new THREE.SphereGeometry(9,16,16), fmat);
      tip.position.set(x, 150, zBase+88);
      group.add(tip);
    } else if(typeOpt==='square'){
      var colS = box(20,150,20, fmat);
      colS.position.set(x, 75, zBase);
      group.add(colS);
      var spoutS = box(20,20,100, fmat);
      spoutS.position.set(x, 150, zBase+50);
      group.add(spoutS);
      var lever = box(10,8,34, fmat);
      lever.position.set(x+16, 130, zBase+10);
      group.add(lever);
    } else {
      var colC = new THREE.Mesh(new THREE.CylinderGeometry(11,11,190,20), fmat);
      colC.position.set(x, 95, zBase);
      colC.castShadow=true;
      group.add(colC);
      var leverC = box(46,10,10, fmat);
      leverC.position.set(x, 175, zBase+14);
      group.add(leverC);
      var spoutC = new THREE.Mesh(new THREE.CylinderGeometry(6,6,70,14), fmat);
      spoutC.rotation.x = Math.PI/2;
      spoutC.position.set(x, 185, zBase+35);
      spoutC.castShadow = true;
      group.add(spoutC);
    }
  }

  var FAUCET_Z = -(MOD_DEPTH/2 - 40);

  function buildSink(group, x, topY, width, shape){
    var sinkModel = resolveModel('sink', shape);
    if(sinkModel){
      var inst = instantiateModel(sinkModel, {});
      applyVariant(inst, sinkModel, 'sink_'+shape);
      var natural = sinkModel.object.userData.fit.natural;
      var w = natural.x * inst.scale.x;
      if(w > width - 60) inst.scale.multiplyScalar((width - 60) / w);
      // Hinterkante mit Abstand vor die Armatur setzen
      var d = natural.z * inst.scale.z;
      inst.position.set(x, topY, Math.max(10, FAUCET_Z + 45 + d/2));
      group.add(inst);
    } else {
      var opt = findOpt(SINK_SHAPES, shape);
      var sinkKind = shape==='round' ? 'travertine' : (shape==='oval' ? 'darkstone' : 'fleck-white');
      var smat = texMat(sinkKind, opt, 2, 2);
      var depth = Math.min(400, MOD_DEPTH-80);
      var mesh;
      if(shape==='rect'){
        mesh = box(Math.min(width-80,600), 120, depth*0.95, smat);
        mesh.position.set(x, topY+60, 10);
      } else {
        var radius = Math.min(width,600)/2 - 20;
        mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,120,40), smat);
        mesh.scale.set(1, 1, shape==='oval'? (depth/2)/radius : 1);
        mesh.position.set(x, topY+60, 10);
        mesh.castShadow = true; mesh.receiveShadow = true;
      }
      group.add(mesh);
    }
    var finish = findOpt(FAUCET_FINISHES, state.faucetFinish);
    buildFaucetAt(group, x, topY, finish);
  }
  function buildFaucetAt(group, x, topY, finish){
    var wrap = new THREE.Group();
    wrap.position.y = topY;
    var faucetModel = resolveModel('faucet', state.faucetType);
    if(faucetModel){
      var inst = instantiateModel(faucetModel, {});
      applyVariant(inst, faucetModel, 'faucet_'+state.faucetType);
      if(finish.key !== 'original') applyFaucetFinish(inst, finish);
      inst.position.set(x, 0, FAUCET_Z);
      wrap.add(inst);
    } else {
      buildFaucet(wrap, x, FAUCET_Z, finish);
    }
    group.add(wrap);
  }

  function moduleTotalWidth(mods){
    var w = 0;
    for(var i=0;i<mods.length;i++){ w += mods[i].width; }
    w += GAP*Math.max(0, mods.length-1);
    return w;
  }

  function buildVanity(){
    var frontOpt = findOpt(FRONTS, state.front);
    var topOpt = findOpt(TOPS, state.top);
    var handleOpt = findOpt(HANDLES, state.handle);
    var frontKind = frontKindFor(state.front);

    var totalW = moduleTotalWidth(state.modules);
    var baseY = state.mountHeight;
    var x = -totalW/2;

    for(var i=0;i<state.modules.length;i++){
      var m = state.modules[i];
      var cx = x + m.width/2;

      var corpusMat = texMat(frontKind, frontOpt, Math.max(1,Math.round(m.width/280)), Math.max(1,Math.round(CORPUS_H/280)), {w:m.width, h:CORPUS_H});
      var corpus = box(m.width-4, CORPUS_H, MOD_DEPTH, corpusMat);
      corpus.position.set(cx, baseY + CORPUS_H/2, 0);
      furnitureGroup.add(corpus);

      if(customModels.handle){
        var handleInst = instantiateModel(customModels.handle, {width: m.width-60});
        handleInst.position.set(cx, baseY + CORPUS_H - 34, MOD_DEPTH/2 + 8);
        furnitureGroup.add(handleInst);
      } else {
        var handleMat = texMat('brushed', handleOpt, Math.max(1,Math.round((m.width-60)/140)), 1, {w:m.width-60, h:12});
        var handle = box(m.width-60, 12, 22, handleMat);
        handle.position.set(cx, baseY + CORPUS_H - 34, MOD_DEPTH/2 + 8);
        furnitureGroup.add(handle);
      }

      if(m.sink){
        buildSink(furnitureGroup, cx, baseY + CORPUS_H + TOP_VANITY_T, m.width, m.shape);
      }
      x += m.width + GAP;
    }

    var topMat = texMat('stone-fine', topOpt, Math.max(1,Math.round((totalW+30)/380)), Math.max(1,Math.round((MOD_DEPTH+30)/380)), {w:totalW+30, h:MOD_DEPTH+30});
    var top = box(totalW+30, TOP_VANITY_T, MOD_DEPTH+30, topMat);
    top.position.set(0, baseY + CORPUS_H + TOP_VANITY_T/2, 0);
    furnitureGroup.add(top);

    wall.position.y = 1700;
    mirrorGroupMesh.visible = state.mirror;
    if(state.mirror){
      var mr = Math.min(420, Math.max(220, totalW*0.34));
      mirrorGlass.scale.set(mr,mr,1);
      mirrorRing.scale.set(mr,mr,1);
      var my = baseY + CORPUS_H + TOP_VANITY_T + mr + 220;
      mirrorGroupMesh.position.set(0, my, -MOD_DEPTH/2 - 4);
    }

    return {totalW: totalW, topY: baseY+CORPUS_H+TOP_VANITY_T};
  }

  function buildFrameLeg(cxGroup, xPos, height, frontMat){
    var half = MOD_DEPTH/2 - 30;
    var postF = box(LEG_PROFILE, height, LEG_PROFILE, frontMat);
    postF.position.set(xPos, height/2, half);
    cxGroup.add(postF);
    var postB = box(LEG_PROFILE, height, LEG_PROFILE, frontMat);
    postB.position.set(xPos, height/2, -half);
    cxGroup.add(postB);
    var bar = box(LEG_PROFILE, LEG_PROFILE, half*2+LEG_PROFILE, frontMat);
    bar.position.set(xPos, height - LEG_PROFILE/2, 0);
    cxGroup.add(bar);
  }

  function buildSideboard(){
    var frontOpt = findOpt(FRONTS, state.front);
    var handleOpt = findOpt(HANDLES, state.handle);
    var frontKind = frontKindFor(state.front);
    var frameMat = texMat('brushed-dark', {hex:0x24262a, rough:0.5, metal:0.75}, 1, 3);

    var totalW = moduleTotalWidth(state.modules);
    var frameH = state.frameHeight;
    var baseY = frameH;
    var x = -totalW/2;

    for(var i=0;i<state.modules.length;i++){
      var m = state.modules[i];
      var cx = x + m.width/2;

      var corpusMat = texMat(frontKind, frontOpt, Math.max(1,Math.round(m.width/280)), Math.max(1,Math.round(CORPUS_H/280)), {w:m.width, h:CORPUS_H});
      var corpus = box(m.width-4, CORPUS_H, MOD_DEPTH, corpusMat);
      corpus.position.set(cx, baseY + CORPUS_H/2, 0);
      furnitureGroup.add(corpus);

      var doorGap = 6;
      if(customModels.handle){
        var hL = instantiateModel(customModels.handle, {width: CORPUS_H-90});
        hL.rotation.z = Math.PI/2;
        hL.position.set(cx - doorGap/2 - 6, baseY+CORPUS_H/2, MOD_DEPTH/2+6);
        furnitureGroup.add(hL);
        var hR = instantiateModel(customModels.handle, {width: CORPUS_H-90});
        hR.rotation.z = Math.PI/2;
        hR.position.set(cx + doorGap/2 + 6, baseY+CORPUS_H/2, MOD_DEPTH/2+6);
        furnitureGroup.add(hR);
      } else {
        var handleMat = texMat('brushed', handleOpt, 1, Math.max(1,Math.round((CORPUS_H-90)/140)), {w:10, h:CORPUS_H-90});
        var handleL = box(10, CORPUS_H-90, 18, handleMat);
        handleL.position.set(cx - doorGap/2 - 6, baseY+CORPUS_H/2, MOD_DEPTH/2+6);
        furnitureGroup.add(handleL);
        var handleR = box(10, CORPUS_H-90, 18, handleMat);
        handleR.position.set(cx + doorGap/2 + 6, baseY+CORPUS_H/2, MOD_DEPTH/2+6);
        furnitureGroup.add(handleR);
      }

      x += m.width + GAP;
    }

    var topMat = texMat(frontKind, frontOpt, Math.max(1,Math.round((totalW+10)/280)), Math.max(1,Math.round((MOD_DEPTH+10)/280)), {w:totalW+10, h:MOD_DEPTH+10});
    var top = box(totalW+10, TOP_SIDEBOARD_T, MOD_DEPTH+10, topMat);
    top.position.set(0, baseY + CORPUS_H + TOP_SIDEBOARD_T/2, 0);
    furnitureGroup.add(top);

    var legPositions = [-totalW/2 + LEG_PROFILE, totalW/2 - LEG_PROFILE];
    if(totalW > 1400){ legPositions.splice(1,0,0); }
    for(var j=0;j<legPositions.length;j++){
      buildFrameLeg(furnitureGroup, legPositions[j], frameH, frameMat);
    }

    wall.position.y = 1700;
    mirrorGroupMesh.visible = false;

    return {totalW: totalW, topY: baseY+CORPUS_H+TOP_SIDEBOARD_T};
  }

  var userMovedCamera = false;
  canvas.addEventListener('pointerdown', function(){ userMovedCamera = true; });
  canvas.addEventListener('wheel', function(){ userMovedCamera = true; });

  function rebuildScene(opts){
    opts = opts || {};
    while(furnitureGroup.children.length){
      var c = furnitureGroup.children.pop();
      if(c.geometry) c.geometry.dispose();
    }
    var info = state.type==='vanity' ? buildVanity() : buildSideboard();
    updateWall();
    renderVariantPicker();

    var box3 = new THREE.Box3().setFromObject(furnitureGroup);
    var size = new THREE.Vector3(); box3.getSize(size);
    var center = new THREE.Vector3(); box3.getCenter(center);
    target.copy(center);

    camRadiusDefault = Math.max(size.x, size.z)*1.55 + size.y*1.1 + 700;
    camRadiusDefault = Math.min(6200, Math.max(1200, camRadiusDefault));

    if(opts.resetCamera || !userMovedCamera){
      camRadius = camRadiusDefault;
      camAzimuth = camAzimuthDefault;
      camElevation = camElevationDefault;
    }
    updateCamera();
    updateDims(info);
    updatePrice();
  }

  function fmt(n){ return Math.round(n) + ' mm'; }
  function updateDims(info){
    var dl = document.getElementById('dimsList');
    var rows = [];
    rows.push(['Gesamtbreite', fmt(info.totalW)]);
    rows.push(['Tiefe', fmt(MOD_DEPTH)]);
    rows.push(['Korpushöhe', fmt(CORPUS_H)]);
    if(state.type==='vanity'){
      rows.push(['Montagehöhe (UK)', fmt(state.mountHeight)]);
      rows.push(['Oberkante Becken ca.', fmt(info.topY + 120)]);
    } else {
      rows.push(['Sockelhöhe', fmt(state.frameHeight)]);
      rows.push(['Gesamthöhe', fmt(state.frameHeight + CORPUS_H + TOP_SIDEBOARD_T)]);
    }
    dl.innerHTML = rows.map(function(r){
      return '<dt>'+r[0]+'</dt><dd>'+r[1]+'</dd>';
    }).join('');
  }

  /* ---------- UI wiring ---------- */
  function renderModuleList(){
    var wrap = document.getElementById('moduleList');
    wrap.innerHTML = state.modules.map(function(m, i){
      var sinkUI = '';
      if(state.type==='vanity'){
        var opts = SINK_SHAPES.map(function(s){
          return '<option value="'+s.key+'"'+(s.key===m.shape?' selected':'')+'>'+s.name+'</option>';
        }).join('');
        sinkUI =
          '<label class="mod-sink"><input type="checkbox" class="sink-toggle" data-idx="'+i+'"'+(m.sink?' checked':'')+'> Becken</label>'+
          (m.sink ? '<select class="sink-shape" data-idx="'+i+'">'+opts+'</select>' : '');
      }
      return '<div class="module-row">'+
        '<span class="mod-width">'+m.width+' mm</span>'+
        sinkUI+
        '<button class="mod-remove" data-idx="'+i+'" title="Modul entfernen">&#10005;</button>'+
      '</div>';
    }).join('');

    var totalW = moduleTotalWidth(state.modules);
    var capHint = document.getElementById('capHint');
    var atMax = state.modules.length >= MAX_MODULES || totalW >= MAX_WIDTH;
    document.querySelectorAll('.btn-add').forEach(function(b){ b.disabled = atMax; });
    capHint.textContent = atMax ? 'Maximale Breite bzw. Modulzahl erreicht.' : (state.modules.length===0 ? 'Mindestens ein Modul hinzufügen.' : '');
  }

  document.getElementById('moduleList').addEventListener('click', function(e){
    var btn = e.target.closest('.mod-remove');
    if(!btn) return;
    var idx = parseInt(btn.getAttribute('data-idx'),10);
    if(state.modules.length<=1) return;
    state.modules.splice(idx,1);
    renderModuleList();
    rebuildScene();
  });
  document.getElementById('moduleList').addEventListener('change', function(e){
    var idx = e.target.getAttribute('data-idx');
    if(idx===null) return;
    idx = parseInt(idx,10);
    if(e.target.classList.contains('sink-toggle')){
      state.modules[idx].sink = e.target.checked;
      renderModuleList();
      rebuildScene();
    } else if(e.target.classList.contains('sink-shape')){
      state.modules[idx].shape = e.target.value;
      rebuildScene();
    }
  });

  document.querySelectorAll('.btn-add').forEach(function(btn){
    btn.addEventListener('click', function(){
      var w = parseInt(btn.getAttribute('data-add'),10);
      if(state.modules.length >= MAX_MODULES) return;
      state.modules.push({width:w, sink:false, shape:'round'});
      renderModuleList();
      rebuildScene();
    });
  });

  document.getElementById('typeSwitch').addEventListener('click', function(e){
    var btn = e.target.closest('.seg-btn');
    if(!btn) return;
    state.type = btn.getAttribute('data-type');
    document.querySelectorAll('#typeSwitch .seg-btn').forEach(function(b){ b.classList.toggle('active', b===btn); });
    document.getElementById('mountGroup').style.display = state.type==='vanity' ? '' : 'none';
    document.getElementById('frameGroup').style.display = state.type==='sideboard' ? '' : 'none';
    document.getElementById('topGroup').style.display = state.type==='vanity' ? '' : 'none';
    document.getElementById('mirrorGroup').style.display = state.type==='vanity' ? '' : 'none';
    renderModuleList();
    rebuildScene({resetCamera:true});
  });

  document.getElementById('mountHeight').addEventListener('input', function(e){
    state.mountHeight = parseInt(e.target.value,10);
    document.getElementById('mountHeightVal').textContent = state.mountHeight+' mm';
    rebuildScene();
  });

  document.getElementById('frameHeightSwitch').addEventListener('click', function(e){
    var btn = e.target.closest('.type-btn');
    if(!btn) return;
    state.frameHeight = parseInt(btn.getAttribute('data-frame'),10);
    document.querySelectorAll('#frameHeightSwitch .type-btn').forEach(function(b){ b.classList.toggle('active', b===btn); });
    rebuildScene();
  });

  document.getElementById('mirrorToggle').addEventListener('change', function(e){
    state.mirror = e.target.checked;
    rebuildScene();
  });

  document.getElementById('installToggle').addEventListener('change', function(e){
    state.install = e.target.checked;
    updatePrice();
  });

  function renderSwatches(containerId, list, stateKey, labelId){
    var el = document.getElementById(containerId);
    el.innerHTML = list.map(function(o){
      return '<button class="swatch'+(state[stateKey]===o.key?' active':'')+'" data-key="'+o.key+'" title="'+o.name+'">'+
        // Bild als Vorschau; fehlt die Datei, bleibt die Farbe sichtbar
        '<span class="dot" style="background:#'+o.hex.toString(16).padStart(6,'0')+
          (o.texture ? ' url(\''+o.texture+'\') center/cover' : '')+'"></span>'+
        '<span class="lbl">'+o.name+'</span></button>';
    }).join('');
    if(labelId){
      var current = findOpt(list, state[stateKey]);
      document.getElementById(labelId).textContent = current.name;
    }
    el.addEventListener('click', function(e){
      var btn = e.target.closest('.swatch');
      if(!btn) return;
      state[stateKey] = btn.getAttribute('data-key');
      el.querySelectorAll('.swatch').forEach(function(b){ b.classList.toggle('active', b===btn); });
      if(labelId) document.getElementById(labelId).textContent = findOpt(list, state[stateKey]).name;
      rebuildScene();
    });
  }
  renderSwatches('frontSwatches', FRONTS, 'front', 'frontLabel');
  renderSwatches('topSwatches', TOPS, 'top', 'topLabel');
  renderSwatches('handleSwatches', HANDLES, 'handle', 'handleLabel');
  renderSwatches('wallSwatches', WALLS, 'wall', 'wallLabel');
  renderSwatches('faucetFinishSwatches', FAUCET_FINISHES, 'faucetFinish', null);

  (function renderFaucetTypes(){
    var el = document.getElementById('faucetTypeSwitch');
    el.innerHTML = FAUCET_TYPES.map(function(o){
      return '<button class="type-btn'+(state.faucetType===o.key?' active':'')+'" data-key="'+o.key+'">'+o.name+'</button>';
    }).join('');
    el.addEventListener('click', function(e){
      var btn = e.target.closest('.type-btn');
      if(!btn) return;
      state.faucetType = btn.getAttribute('data-key');
      el.querySelectorAll('.type-btn').forEach(function(b){ b.classList.toggle('active', b===btn); });
      rebuildScene();
    });
  })();

  /* ---------- 3D export (OBJ + MTL + textures, zipped) ---------- */
  function crc32(bytes){
    if(!crc32.table){
      var table = [];
      for(var n=0;n<256;n++){
        var c = n;
        for(var k=0;k<8;k++){ c = (c&1) ? (0xEDB88320 ^ (c>>>1)) : (c>>>1); }
        table[n]=c>>>0;
      }
      crc32.table = table;
    }
    var crc = 0 ^ (-1);
    for(var i=0;i<bytes.length;i++){
      crc = (crc>>>8) ^ crc32.table[(crc ^ bytes[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  }

  function buildZip(files){
    var encoder = new TextEncoder();
    var localParts = [], centralParts = [], offset = 0;
    files.forEach(function(file){
      var nameBytes = encoder.encode(file.name);
      var data = file.data;
      var crc = crc32(data);
      var size = data.length;

      var local = new Uint8Array(30 + nameBytes.length);
      var dv = new DataView(local.buffer);
      dv.setUint32(0, 0x04034b50, true);
      dv.setUint16(4, 20, true);
      dv.setUint16(6, 0, true);
      dv.setUint16(8, 0, true);
      dv.setUint16(10, 0, true);
      dv.setUint16(12, 0, true);
      dv.setUint32(14, crc, true);
      dv.setUint32(18, size, true);
      dv.setUint32(22, size, true);
      dv.setUint16(26, nameBytes.length, true);
      dv.setUint16(28, 0, true);
      local.set(nameBytes, 30);
      localParts.push(local, data);

      var central = new Uint8Array(46 + nameBytes.length);
      var cdv = new DataView(central.buffer);
      cdv.setUint32(0, 0x02014b50, true);
      cdv.setUint16(4, 20, true);
      cdv.setUint16(6, 20, true);
      cdv.setUint16(8, 0, true);
      cdv.setUint16(10, 0, true);
      cdv.setUint16(12, 0, true);
      cdv.setUint16(14, 0, true);
      cdv.setUint32(16, crc, true);
      cdv.setUint32(20, size, true);
      cdv.setUint32(24, size, true);
      cdv.setUint16(28, nameBytes.length, true);
      cdv.setUint16(30, 0, true);
      cdv.setUint16(32, 0, true);
      cdv.setUint16(34, 0, true);
      cdv.setUint16(36, 0, true);
      cdv.setUint32(38, 0, true);
      cdv.setUint32(42, offset, true);
      central.set(nameBytes, 46);
      centralParts.push(central);

      offset += local.length + data.length;
    });

    var centralStart = offset;
    var centralSize = centralParts.reduce(function(s,p){ return s+p.length; }, 0);
    var end = new Uint8Array(22);
    var edv = new DataView(end.buffer);
    edv.setUint32(0, 0x06054b50, true);
    edv.setUint16(4,0,true);
    edv.setUint16(6,0,true);
    edv.setUint16(8, files.length, true);
    edv.setUint16(10, files.length, true);
    edv.setUint32(12, centralSize, true);
    edv.setUint32(16, centralStart, true);
    edv.setUint16(20,0,true);

    return new Blob(localParts.concat(centralParts, [end]), {type:'application/zip'});
  }

  function canvasToPngBytes(canvas){
    return new Promise(function(resolve, reject){
      canvas.toBlob(function(blob){
        if(!blob){ reject(new Error('toBlob failed')); return; }
        blob.arrayBuffer().then(function(buf){ resolve(new Uint8Array(buf)); }).catch(reject);
      }, 'image/png');
    });
  }
  function imageLikeToPngBytes(img){
    // Works for a canvas (our procedural textures) as well as an
    // HTMLImageElement/ImageBitmap (textures from an uploaded glTF/GLB).
    if(img && typeof img.toBlob === 'function') return canvasToPngBytes(img);
    var w = img.width || img.naturalWidth || 512;
    var h = img.height || img.naturalHeight || 512;
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.getContext('2d').drawImage(img, 0, 0, w, h);
    return canvasToPngBytes(c);
  }

  function buildObjMtl(){
    furnitureGroup.updateMatrixWorld(true);
    var meshes = [];
    furnitureGroup.traverse(function(o){ if(o.isMesh) meshes.push(o); });

    var SCALE = 1/1000; // mm -> m
    var objLines = ['# Vanova Badmöbel Konfigurator', '# Einheiten: Meter (Originalmodell in mm)', 'mtllib model.mtl', ''];
    var mtlLines = [];
    var matRegistry = new Map();
    var matCounter = 0;
    var vOffset = 0, vtOffset = 0, vnOffset = 0;
    var v = new THREE.Vector3(), n = new THREE.Vector3();

    function registerMaterial(mat){
      var img = mat.map ? mat.map.image : null;
      var key = img || ('flat_'+mat.color.getHexString());
      if(!matRegistry.has(key)){
        matCounter++;
        var name = 'mat'+matCounter;
        var texFilename = img ? ('tex_'+matCounter+'.png') : null;
        matRegistry.set(key, {name:name, texFilename:texFilename, image:img});
        mtlLines.push('newmtl '+name);
        if(img){
          mtlLines.push('Kd 1.000000 1.000000 1.000000');
          mtlLines.push('map_Kd '+texFilename);
        } else {
          var c = mat.color;
          mtlLines.push('Kd '+c.r.toFixed(4)+' '+c.g.toFixed(4)+' '+c.b.toFixed(4));
        }
        mtlLines.push('Ka 0.000000 0.000000 0.000000');
        mtlLines.push('illum 2');
        mtlLines.push('');
      }
      return matRegistry.get(key);
    }

    meshes.forEach(function(mesh, mi){
      var geo = mesh.geometry;
      var pos = geo.attributes.position;
      var nor = geo.attributes.normal;
      var uv = geo.attributes.uv;
      var index = geo.index;
      var matrix = mesh.matrixWorld;
      var normalMatrix = new THREE.Matrix3().getNormalMatrix(matrix);
      var meshMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      var repX = (meshMat.map && meshMat.map.repeat) ? meshMat.map.repeat.x : 1;
      var repY = (meshMat.map && meshMat.map.repeat) ? meshMat.map.repeat.y : 1;
      var matInfo = registerMaterial(meshMat);

      objLines.push('o part_'+mi);
      objLines.push('usemtl '+matInfo.name);

      var vCount = pos.count;
      for(var i=0;i<vCount;i++){
        v.fromBufferAttribute(pos, i).applyMatrix4(matrix);
        objLines.push('v '+(v.x*SCALE).toFixed(5)+' '+(v.y*SCALE).toFixed(5)+' '+(v.z*SCALE).toFixed(5));
      }
      if(uv){
        for(var iu=0; iu<uv.count; iu++){
          objLines.push('vt '+(uv.getX(iu)*repX).toFixed(5)+' '+(uv.getY(iu)*repY).toFixed(5));
        }
      }
      if(nor){
        for(var iN=0; iN<nor.count; iN++){
          n.fromBufferAttribute(nor, iN).applyMatrix3(normalMatrix).normalize();
          objLines.push('vn '+n.x.toFixed(5)+' '+n.y.toFixed(5)+' '+n.z.toFixed(5));
        }
      }

      function tok(localIdx){
        var vi = vOffset+localIdx+1;
        if(uv && nor) return vi+'/'+(vtOffset+localIdx+1)+'/'+(vnOffset+localIdx+1);
        if(uv) return vi+'/'+(vtOffset+localIdx+1);
        if(nor) return vi+'//'+(vnOffset+localIdx+1);
        return ''+vi;
      }
      if(index){
        for(var f=0; f<index.count; f+=3){
          objLines.push('f '+tok(index.getX(f))+' '+tok(index.getX(f+1))+' '+tok(index.getX(f+2)));
        }
      } else {
        for(var f2=0; f2<vCount; f2+=3){
          objLines.push('f '+tok(f2)+' '+tok(f2+1)+' '+tok(f2+2));
        }
      }

      vOffset += vCount;
      if(uv) vtOffset += uv.count;
      if(nor) vnOffset += nor.count;
      objLines.push('');
    });

    return { obj: objLines.join('\n'), mtl: mtlLines.join('\n'), materials: matRegistry };
  }

  function buildConfigJson(){
    var totalW = moduleTotalWidth(state.modules);
    var priceRes = computePrice();
    var data = {
      product: 'Vanova Badmöbel-System',
      generatedAt: new Date().toISOString(),
      type: state.type,
      typeLabel: state.type==='vanity' ? 'Waschtisch (Wandmontage)' : 'Sideboard (auf Gestell)',
      dimensionsMm: {
        totalWidth: Math.round(totalW),
        depth: MOD_DEPTH,
        corpusHeight: CORPUS_H,
        mountHeight: state.type==='vanity' ? state.mountHeight : undefined,
        frameHeight: state.type==='sideboard' ? state.frameHeight : undefined
      },
      modules: state.modules.map(function(m, i){
        var mod = { index:i+1, widthMm:m.width };
        if(state.type==='vanity'){
          mod.sink = m.sink;
          if(m.sink){
            var s = findOpt(SINK_SHAPES, m.shape);
            mod.sinkShape = { key:s.key, name:s.name };
          }
        }
        return mod;
      }),
      materials: {
        front: (function(){ var o=findOpt(FRONTS, state.front); return {key:o.key, name:o.name}; })(),
        top: state.type==='vanity' ? (function(){ var o=findOpt(TOPS, state.top); return {key:o.key, name:o.name}; })() : undefined,
        handle: (function(){ var o=findOpt(HANDLES, state.handle); return {key:o.key, name:o.name}; })(),
        faucetType: (function(){ var o=findOpt(FAUCET_TYPES, state.faucetType); return {key:o.key, name:o.name}; })(),
        faucetFinish: (function(){ var o=findOpt(FAUCET_FINISHES, state.faucetFinish); return {key:o.key, name:o.name}; })()
      },
      mirrorShown: state.type==='vanity' ? state.mirror : undefined,
      installService: state.install,
      price: {
        currency: 'CHF',
        note: 'Beispielkalkulation zur Veranschaulichung, exkl. MwSt. – kein verbindliches Angebot.',
        items: priceRes.rows.map(function(r){ return { label:r[0], amountChf:Math.round(r[1]*100)/100 }; }),
        totalChf: Math.round(priceRes.total*100)/100
      }
    };
    return JSON.stringify(data, null, 2);
  }

  function exportFilename(){
    var totalW = moduleTotalWidth(state.modules);
    var typeName = state.type==='vanity' ? 'waschtisch' : 'sideboard';
    return 'vanova-'+typeName+'-'+Math.round(totalW)+'mm.zip';
  }

  async function buildExportZip(){
    var built = buildObjMtl();
    var encoder = new TextEncoder();
    var files = [
      {name:'model.obj', data: encoder.encode(built.obj)},
      {name:'model.mtl', data: encoder.encode(built.mtl)},
      {name:'config.json', data: encoder.encode(buildConfigJson())},
      {name:'README.txt', data: encoder.encode(
        'Vanova Badmöbel Konfigurator – 3D-Export\r\n'+
        '=========================================\r\n\r\n'+
        'model.obj / model.mtl: Geometrie + Materialien (Wavefront OBJ), Einheit Meter.\r\n'+
        'tex_*.png: zugehörige Oberflächentexturen.\r\n'+
        'config.json: die gewählte Konfiguration (Masse, Materialien, Preis-Richtwert)\r\n'+
        'in lesbarer Form, z. B. zum Wiederherstellen oder Weitergeben der Auswahl.\r\n\r\n'+
        'Vereinfachtes parametrisches Modell zur Veranschaulichung der Konfiguration,\r\n'+
        'kein Fertigungsmodell.\r\n'
      )}
    ];
    var pending = [];
    built.materials.forEach(function(m){
      if(m.image && m.texFilename){
        pending.push(imageLikeToPngBytes(m.image).then(function(bytes){
          files.push({name:m.texFilename, data:bytes});
        }));
      }
    });
    await Promise.all(pending);
    return buildZip(files);
  }

  document.getElementById('exportModel').addEventListener('click', async function(){
    var btn = this;
    var statusEl = document.getElementById('exportStatus');
    btn.disabled = true;
    statusEl.textContent = 'Modell wird erstellt …';
    try{
      var zipBlob = await buildExportZip();
      var url = URL.createObjectURL(zipBlob);
      var a = document.createElement('a');
      a.href = url;
      a.download = exportFilename();
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); }, 10000);
      statusEl.textContent = 'Download gestartet.';
    }catch(err){
      console.error('Export fehlgeschlagen', err);
      statusEl.textContent = 'Export fehlgeschlagen – Details in der Browser-Konsole.';
    } finally {
      btn.disabled = false;
      setTimeout(function(){ statusEl.textContent = ''; }, 5000);
    }
  });

  /* ---------- resize / render loop ---------- */
  function onResize(){
    var w = viewport.clientWidth, h = viewport.clientHeight;
    if(w<10||h<10) return;
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
    renderer.setSize(w,h,false);
  }
  window.addEventListener('resize', onResize);

  function animate(){
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  /* ---------- Umgebungs-Texturen (Wand, Spiegel) ---------- */
  function updateWall(){
    var opt = findOpt(WALLS, state.wall);
    var mat = texMat('matte', opt, 6, 4, {w:6000, h:3400});
    // im dunklen Design die Wand nur abdunkeln statt umfärben
    mat.color.set(currentTheme()==='dark' ? 0x4a4a46 : 0xffffff);
    if(wall.material !== wallMat) wall.material.dispose();
    wall.material = mat;
  }

  function loadEnvironmentTextures(){
    getImageTexture(MIRROR_SMUDGES, false, function(tex){
      // dunkle Stellen = glatt, Schlieren = matter
      mirrorGlass.material.roughnessMap = tex;
      mirrorGlass.material.roughness = 0.35;
      mirrorGlass.material.needsUpdate = true;
    });
  }

  /* ---------- init ---------- */
  applyTheme();
  loadEnvironmentTextures();
  onResize();
  renderModuleList();
  renderModelSlots();
  renderModelCredits();
  document.getElementById('frameGroup').style.display = 'none';
  rebuildScene({resetCamera:true});
  animate();
  restoreCustomModelsFromStorage();
})();
