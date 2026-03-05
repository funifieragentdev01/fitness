#!/usr/bin/env python3
"""Generate all 7 Reels clips via Freepik API (Seedance Pro 1080p)"""
import base64, json, urllib.request, sys, time

API_KEY = "FPSX69b6861d3b45e4591f8e8d354ebf3ec0"
ENDPOINT = "https://api.freepik.com/v1/ai/image-to-video/seedance-pro-1080p"
REELS_DIR = "/Users/agent/fun/prj/fitness/doc/social/reels"

# Each clip: start image -> transition prompt
clips = [
    {
        "name": "clip1-couch",
        "image": "cena1-couch.png",
        "prompt": "The overweight man on the couch slowly reaches for more junk food, eating lazily while watching TV. He looks sad and tired. Camera slowly zooms in. Dark moody ambient lighting. Cinematic slow motion."
    },
    {
        "name": "clip2-crying",
        "image": "cena2-crying.jpeg",
        "prompt": "The man sitting on the couch puts his hands on his head in frustration and despair, overwhelmed by his unhealthy lifestyle. He looks emotional and stressed. Soft dramatic lighting. Cinematic."
    },
    {
        "name": "clip3-committed",
        "image": "cena3-committed.jpeg",
        "prompt": "The young man sits on the couch looking at his smartphone with determination. He scrolls through a fitness app on his phone, his expression changing from sadness to hope. Warm ambient lighting. Cinematic."
    },
    {
        "name": "clip4-app-food",
        "image": "cena4-app-food.png",
        "prompt": "Close-up of hands holding a smartphone displaying a fitness meal plan app with colorful food images and nutritional information. The person scrolls through the app. Warm kitchen lighting. Shallow depth of field."
    },
    {
        "name": "clip5-food",
        "image": "cena5-food.jpeg",
        "prompt": "Top-down view of a beautiful Brazilian healthy meal plate with rice, beans, fresh salad, and grilled chicken. Steam rises gently from the warm food. Camera slowly pans across the plate. Natural warm lighting. Professional food photography."
    },
    {
        "name": "clip6-app-treino",
        "image": "cena6-app-treino.png",
        "prompt": "Close-up of a smartphone screen showing a workout training plan app with exercise routines and progress charts. The person's finger taps on a workout. Modern dark UI theme. Warm ambient lighting."
    },
    {
        "name": "clip7-gym",
        "image": "cena7-gym.png",
        "prompt": "A fit muscular man training intensely at the gym, doing dumbbell curls with perfect form. He is focused and determined. Dramatic gym lighting with warm tones. Cinematic slow motion. Camera slowly orbits around him."
    }
]

def create_task(clip):
    img_path = f"{REELS_DIR}/{clip['image']}"
    with open(img_path, 'rb') as f:
        img_b64 = base64.b64encode(f.read()).decode()
    
    ext = clip['image'].split('.')[-1]
    mime = 'image/jpeg' if ext in ('jpeg', 'jpg') else 'image/png'
    
    payload = json.dumps({
        'image': f'data:{mime};base64,{img_b64}',
        'prompt': clip['prompt'],
        'duration': '5',
        'aspect_ratio': 'social_story_9_16'
    }).encode()
    
    req = urllib.request.Request(ENDPOINT, data=payload, headers={
        'x-freepik-api-key': API_KEY,
        'Content-Type': 'application/json'
    })
    
    try:
        resp = urllib.request.urlopen(req, timeout=60)
        data = json.loads(resp.read().decode())
        task_id = data['data']['task_id']
        print(f"✅ {clip['name']}: task_id={task_id}")
        return task_id
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f"❌ {clip['name']}: HTTP {e.code} - {err}")
        return None

def check_task(task_id):
    req = urllib.request.Request(f"{ENDPOINT}/{task_id}", headers={
        'x-freepik-api-key': API_KEY
    })
    resp = urllib.request.urlopen(req, timeout=15)
    return json.loads(resp.read().decode())

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "create"
    
    if mode == "create":
        # Skip clip1 (already created)
        tasks = {"clip1-couch": "f408f81a-665c-4b3f-a1bc-9c2a09326991"}
        for clip in clips[1:]:  # Skip first (already submitted)
            task_id = create_task(clip)
            if task_id:
                tasks[clip['name']] = task_id
            time.sleep(2)  # Rate limit
        
        # Save task IDs
        with open(f"{REELS_DIR}/tasks.json", 'w') as f:
            json.dump(tasks, f, indent=2)
        print(f"\n📝 Saved {len(tasks)} tasks to tasks.json")
    
    elif mode == "status":
        with open(f"{REELS_DIR}/tasks.json") as f:
            tasks = json.load(f)
        
        for name, task_id in tasks.items():
            result = check_task(task_id)
            status = result['data']['status']
            generated = result['data'].get('generated', [])
            if generated:
                url = generated[0].get('url', 'N/A')
                print(f"{'✅' if status=='COMPLETED' else '⏳'} {name}: {status} -> {url[:80]}")
            else:
                print(f"{'✅' if status=='COMPLETED' else '⏳'} {name}: {status}")
    
    elif mode == "download":
        with open(f"{REELS_DIR}/tasks.json") as f:
            tasks = json.load(f)
        
        for name, task_id in tasks.items():
            result = check_task(task_id)
            status = result['data']['status']
            generated = result['data'].get('generated', [])
            if status == 'COMPLETED' and generated:
                url = generated[0].get('url') or generated[0].get('video')
                if url:
                    out = f"{REELS_DIR}/{name}.mp4"
                    urllib.request.urlretrieve(url, out)
                    print(f"⬇️ {name}.mp4 downloaded")
                else:
                    print(f"⚠️ {name}: completed but no URL found. Keys: {list(generated[0].keys())}")
            else:
                print(f"⏳ {name}: {status} (not ready)")
