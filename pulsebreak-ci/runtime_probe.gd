extends SceneTree

var frame_count := 0
var instance: Node

func _initialize() -> void:
	print("PULSEBREAK_PROBE_START")
	var packed := load("res://main.tscn")
	if packed == null:
		push_error("PULSEBREAK_PROBE_LOAD_FAILED")
		quit(10)
		return
	instance = packed.instantiate()
	root.add_child(instance)
	print("PULSEBREAK_PROBE_SCENE_ADDED")

func _process(_delta: float) -> bool:
	frame_count += 1
	if frame_count == 30:
		print("PULSEBREAK_PROBE_FRAME_30 children=", root.get_child_count())
	if frame_count >= 120:
		print("PULSEBREAK_PROBE_OK")
		quit(0)
	return false
