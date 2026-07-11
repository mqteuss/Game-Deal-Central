extends SceneTree

var frame_count: int = 0
var game: Node
var capture_dir := "res://../pulsebreak-v2/screenshots"

func fail(message: String, code: int) -> void:
	push_error(message)
	quit(code)

func capture(name: String) -> bool:
	var image: Image = root.get_texture().get_image()
	if image == null or image.is_empty():
		fail("PULSEBREAK_V2_SCREENSHOT_EMPTY %s" % name, 31)
		return false
	var path := "%s/%s.png" % [capture_dir, name]
	var error := image.save_png(path)
	if error != OK:
		fail("PULSEBREAK_V2_SCREENSHOT_SAVE_FAILED %s error=%d" % [path, error], 32)
		return false
	print("PULSEBREAK_V2_SCREENSHOT_OK %s %dx%d" % [path, image.get_width(), image.get_height()])
	return true

func _initialize() -> void:
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(capture_dir))
	var packed: PackedScene = load("res://main.tscn") as PackedScene
	if packed == null:
		fail("PULSEBREAK_V2_SCREENSHOT_SCENE_FAILED", 30)
		return
	game = packed.instantiate()
	root.add_child(game)
	if game.get_script() == null:
		fail("PULSEBREAK_V2_SCREENSHOT_SCRIPT_MISSING", 33)
		return
	game.set("sound_enabled", false)

func _process(_delta: float) -> bool:
	frame_count += 1
	if frame_count == 90:
		if not capture("01-menu-landscape"):
			return false
		game.call("reset_game")
	if frame_count == 270:
		game.set("overdrive_meter", 100.0)
		game.call("try_overdrive")
		game.call("spawn_rift_node")
	if frame_count == 360:
		if not capture("02-gameplay-landscape"):
			return false
		game.set("state", 5)
		game.queue_redraw()
	if frame_count == 450:
		if not capture("03-settings-landscape"):
			return false
		print("PULSEBREAK_V2_VISUAL_PROBE_OK")
		quit(0)
	return false
