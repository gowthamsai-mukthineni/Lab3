import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, TextInput, View,
  FlatList, TouchableOpacity, Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const backgroundColor = useRef(new Animated.Value(0)).current; // Animated value for background color

  // Load tasks from AsyncStorage when the app starts
  useEffect(() => {
    loadTasks();
  }, []);

  // Save tasks to AsyncStorage whenever the tasks state changes
  useEffect(() => {
    saveTasks();
  }, [tasks]);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  };

  const addTask = () => {
    if (task.trim()) {
      const newTask = { id: Date.now().toString(), text: task, completed: false };
      setTasks([...tasks, newTask]);
      setTask('');
    }
  };

  const toggleCompleteTask = (taskId) => {
    const updatedTasks = tasks.map((item) =>
      item.id === taskId ? { ...item, completed: !item.completed } : item
    );
    setTasks(updatedTasks);
  };

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter((item) => item.id !== taskId);
    setTasks(updatedTasks);
  };

  const startEditingTask = (taskId, currentText) => {
    setEditingTaskId(taskId);
    setEditingText(currentText);
    // Trigger animation
    Animated.timing(backgroundColor, {
      toValue: 1, // End value
      duration: 500, // Animation duration in ms
      useNativeDriver: false,
    }).start();
  };

  const saveEditedTask = () => {
    const updatedTasks = tasks.map((item) =>
      item.id === editingTaskId ? { ...item, text: editingText } : item
    );
    setTasks(updatedTasks);
    setEditingTaskId(null);
    setEditingText('');
    // Reset animation
    Animated.timing(backgroundColor, {
      toValue: 0, // Reset to initial value
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const interpolatedBackgroundColor = backgroundColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['#fff', '#FFFFE0'], // White to light yellow
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <Animated.View
            style={[
              styles.taskContainer,
              editingTaskId === item.id && { backgroundColor: interpolatedBackgroundColor },
            ]}
          >
            {editingTaskId === item.id ? (
              <TextInput
                style={styles.input}
                value={editingText}
                onChangeText={(text) => setEditingText(text)}
                onSubmitEditing={saveEditedTask}
                placeholder="Edit task"
              />
            ) : (
              <TouchableOpacity onPress={() => toggleCompleteTask(item.id)}>
                <Text
                  style={[
                    styles.taskText,
                    item.completed && styles.completedTask,
                  ]}
                >
                  {item.text}
                </Text>
              </TouchableOpacity>
            )}
            <View style={styles.taskButtons}>
              {editingTaskId === item.id ? (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveEditedTask}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => startEditingTask(item.id, item.text)}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteTask(item.id)}
              >
                <Text style={styles.buttonText}>Del</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#5C5CFF',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  taskButtons: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#FFC107',
    padding: 5,
    borderRadius: 5,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 5,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#FF5C5C',
    padding: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
  },
});
