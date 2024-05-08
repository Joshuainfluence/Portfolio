//// Main site configuration. ////
const configuration = {
    SiteName: 'YAN',
    NumberOfVerticalLines: 25,
    NumberOfDots: 5000,
    colors: {
      CanvasBackgroundColor: '#000000',
      LettersColor: '#23B300',
      LinesColors: ['#45783C', '#279514', '#7d7d7d'],
      LowerLinesColors: ['#3d3d3d'],
      DotsColor: '#7d7d7d'
    }
  }
  ///////////////////////////////
  
  
  // Import all needed dependencies.
  import * as THREE from './ext/three.module.min.js'
  import TWEEN from './ext/tween.js'
  import UI from './ui.js'
  
  // Initialize UI thread. All UI scripting should be done
  // in this instance.
  const ui = new UI(uiCallback)
  
  const windowHeightInRadians = 25
  let camera, scene, renderer
  let sceneMovedAmmount = 0
  let timeoutActive = false
  
  const mainGeomertries = []
  let mainLettersMesh
  
  let touchStartPosition
  
  // Wait for page to load
  window.addEventListener('load', () => {
    const uiWrapper = document.querySelector('.ui-wrapper')
    uiWrapper.classList.remove('page-not-loaded')
    // Loading animation lasts for 3s;
    setTimeout(() => {
      init()
      animate()
    }, 3000)
  })
  
  function init() {
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 2, 20000)
    camera.position.z = 20
  
    scene = new THREE.Scene()
    scene.background = new THREE.Color(configuration.colors.CanvasBackgroundColor)
    const near = 10
    const far = 150
    scene.fog = new THREE.Fog(configuration.colors.CanvasBackgroundColor, near, far)
  
    // Load main letters and generate random lines.
    loadMainLetters()
    for (let index = 0; index < configuration.NumberOfVerticalLines; index++) {
      generateRandomObject(1, [[0.2, 2, 4, 5], [0.1, 0.2]], configuration.colors.LinesColors)
      // Generate few random objects per page.
      generateRandomObject(-windowHeightInRadians * index / 3, [[2, 4], [0.05]], configuration.colors.LowerLinesColors)
    }
  
    renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
  
    // Add listeners.
    window.addEventListener('resize', windowResize, false)
    window.addEventListener('wheel', windowWheelOrTouch, false)
    window.addEventListener('touchstart', e => { touchStartPosition = e.touches[0].pageY }, false)
    window.addEventListener('touchmove', windowWheelOrTouch, false)
    if (!isMobile()) window.addEventListener('mousemove', mouseMove, false)
  }
  
  function animate (time) {
    requestAnimationFrame(animate)
    TWEEN.update()
    render(time)
  }
  
  function render (time) {
    time = time / 1000
    
    if (mainLettersMesh) mainLettersMesh.material.uniforms.time.value = time
    // Move geometries left and right.
    mainGeomertries.forEach((geometry, index) => {
      geometry.scale.x = Math.sin(time / 2 + index * 3) * 0.5 + 0.5
    })
  
    renderer.render(scene, camera)
  }
  
  // **** HELPER FUNCTIONS **** //
  
  // Generate main geometries by random width, height, color and position.
  function generateRandomObject (verticalPosition, availableSizes, availableColors) {
    const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
  
    const randomWidth = availableSizes[0][randomIntFromInterval(0, availableSizes[0].length - 1)]
    const randomHeight = availableSizes[1][randomIntFromInterval(0, availableSizes[1].length - 1)]
    const randomColor = availableColors[randomIntFromInterval(0, availableColors.length - 1)]
  
    const geometry = new THREE.PlaneBufferGeometry(randomWidth, randomHeight, 1)
    geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(-geometry.parameters.width / 2, 0, 0 ))
    const material = new THREE.MeshBasicMaterial({ color: randomColor, side: THREE.FrontSide })
    const mesh = new THREE.Mesh(geometry, material)
  
    mesh.position.x = randomIntFromInterval(-10, 10)
    mesh.position.y = verticalPosition + randomIntFromInterval(-10, 10)
    mesh.position.z = randomIntFromInterval(-10, 10)
  
    scene.add(mesh)
    mainGeomertries.push(mesh)
  }
  
  function loadMainLetters () {
    const fontLoader = new THREE.FontLoader()
    fontLoader.load('resources/fonts/Roboto-Black-3d.json', font => {
      let textGeometry = new THREE.TextGeometry(configuration.SiteName, { font: font, size: 5, height: 3, curveSegments: 3 })
      textGeometry.center()
  
      const textMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { type: 'vec3', value: new THREE.Color( configuration.colors.LettersColor ) }
        },
        vertexShader: vertexShader(),
        fragmentShader: fragmentShader(),
        side: THREE.DoubleSide,
        wireframe: true
      })
      mainLettersMesh = new THREE.Mesh(textGeometry, textMaterial)
      scene.add(mainLettersMesh)
  
      let vertices = []
    
      for (let i = 0; i < configuration.NumberOfDots; i ++) {
        let x = Math.random() * 200 - 100
        let y = Math.random() * 200 - 100
        let z = Math.random() * 200 - 100
      
        vertices.push(x, y, z)
      }
      
      const bufferGeometry = new THREE.BufferGeometry()
      bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
      const pointSprite = new THREE.TextureLoader().load('resources/images/icons/pointImg.png')
      const pointsMaterial = new THREE.PointsMaterial({color: configuration.colors.DotsColor, size: 0.5, map: pointSprite, transparent: true, alphaTest: 0.5})
      const points = new THREE.Points(bufferGeometry, pointsMaterial)
      scene.add(points)
  
      windowResize()
    })
  }
  
  function vertexShader () {
    return `
    varying vec2 vUv;
    uniform float time;
    
    vec3 mod289(vec3 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec4 mod289(vec4 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec4 permute(vec4 x) {
         return mod289(((x*34.0)+1.0)*x);
    }
    
    vec4 taylorInvSqrt(vec4 r)
    {
      return 1.79284291400159 - 0.85373472095314 * r;
    }
    
    float snoise(vec3 v) {
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      
      // First corner
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 =   v - i + dot(i, C.xxx) ;
      
      // Other corners
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
    
      //   x0 = x0 - 0.0 + 0.0 * C.xxx;
      //   x1 = x0 - i1  + 1.0 * C.xxx;
      //   x2 = x0 - i2  + 2.0 * C.xxx;
      //   x3 = x0 - 1.0 + 3.0 * C.xxx;
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
      vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
      
      // Permutations
      i = mod289(i);
      vec4 p = permute( permute( permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
               
      // Gradients: 7x7 points over a square, mapped onto an octahedron.
      // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
      float n_ = 0.142857142857; // 1.0/7.0
      vec3  ns = n_ * D.wyz - D.xzx;
    
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
    
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
    
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
    
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
    
      //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
      //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
    
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      
      // Normalise gradients
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      
      // Mix final noise value
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                    dot(p2,x2), dot(p3,x3) ) );
    }
    
    void main() {
      vUv = uv;
    
      vec3 pos = position;
      float noiseFreq = 3.5;
      float noiseAmp = 0.15; 
      vec3 noisePos = vec3(pos.x * noiseFreq + time, pos.y, pos.z);
      pos.x += snoise(noisePos) * noiseAmp;
    
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
    }
    `
  }
  
  function fragmentShader () {
    return `
    uniform vec3 color;
    void main() {
      gl_FragColor = vec4(color, 1.0 );
    }
    `
  }
  
  function isMobile () {
    try {
      document.createEvent('touchEvent')
      return true
    } catch (err) { return false }
  }
  
  function uiCallback () {
    return {
      onPagingClick (pagingIndex) {
        if (sceneMovedAmmount > sceneMovedAmmount) ui.ui_moveScene('down')
        else ui.ui_moveScene('up')
  
        sceneMovedAmmount = pagingIndex
        moveScene()
      },
      getCurrentPage () {
        return sceneMovedAmmount
      },
      blockSceneScrolling (active) {
        active ? timeoutActive = true : timeoutActive = false
      }
    }
  }
  
  // **** EVENT FUNCTIONS **** //
  
  function moveScene () {
    new TWEEN.Tween(scene.position)
    .to({x: scene.position.x, y: sceneMovedAmmount * windowHeightInRadians, z: scene.position.z}, 1000)
    .easing(TWEEN.Easing.Quartic.InOut)
    .start()
  }
  
  function windowResize () {
    if (mainLettersMesh) {
      const scaleAmmount = Math.min(window.innerWidth / 1100, 1)
      mainLettersMesh.scale.x = scaleAmmount
      mainLettersMesh.scale.y = scaleAmmount
    }
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  
  function windowWheelOrTouch (e) {
    // Limit scrolling to scroll only once in N milliseconds.
    if (timeoutActive) return
    timeoutActive = true
    setTimeout(() => { timeoutActive = false }, 1500)
  
    if (e.deltaY > 0 || (e.touches && e.touches[0].pageY < touchStartPosition)) {
      if (sceneMovedAmmount === 5) return
      sceneMovedAmmount++
      sceneMovedAmmount = Math.min(sceneMovedAmmount, 5)
      moveScene()
      ui.ui_moveScene('down')
      return
    }
  
    if (sceneMovedAmmount === 0) return
    sceneMovedAmmount--
    sceneMovedAmmount = Math.max(sceneMovedAmmount, 0)
    moveScene()
    ui.ui_moveScene('up')
  }
  
  function mouseMove (e) {
    ui.ui_moveEvent(e)
    if (sceneMovedAmmount > 0) return
  
    const xCenter = window.innerWidth / 2
    const yCenter = window.innerHeight / 2
    const CameraXPosition = xCenter - e.clientX
    const CameraYPosition = yCenter - e.clientY
  
    camera.position.x = -CameraXPosition / 100
    camera.position.y = CameraYPosition / 100
    camera.lookAt(scene.position)
  }
  