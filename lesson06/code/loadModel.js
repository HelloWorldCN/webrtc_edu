function initModel() {
    var scene, camera, renderer;
    var c = document.querySelector("canvas");
    var ratio = window.devicePixelRatio ? window.devicePixelRatio : 1;
    width = 440 * ratio;
    height = 330 * ratio;

    //初始化场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfffff0);

    //初始化渲染器
    renderer = new THREE.WebGLRenderer({ canvas: c, antialias: true });
    renderer.setSize(width, height);

    //初始化摄像机
    const aspect = width / height;//纵横比
    camera = new THREE.PerspectiveCamera(1100, aspect, 1, 10);//设置视距
    camera.position.set(0, 0, 2);

    //旋转控制器
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener("changed", renderer);

    //添加环绕光
    const ambientLight = new THREE.AmbientLight(0xaaaaaa, 3);
    scene.add(ambientLight);

    //加载器
    const loader = new THREE.GLTFLoader();
    loader.load("3DSrc/chinese_knot/scene.gltf", (result) => {
        result.scene.scale.set(0.2, 0.2, 0.2);
        scene.add(result.scene);
        console.log("init sucess");
    }, undefined, (error) => {
        console.error(error);
    });

    const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };

    animate();
}