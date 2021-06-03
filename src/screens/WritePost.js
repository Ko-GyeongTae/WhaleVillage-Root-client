import React, { useEffect } from "react";
import { Text, View, StyleSheet, Alert, TextInput, Keyboard, Image, ScrollView } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import AsyncStorage from '@react-native-async-storage/async-storage';
import useInput from "../hooks/useInput";
import contentInput from "../hooks/contentInput";
import { useState } from "react";
import axios from "axios";
import * as ImagePicker from 'expo-image-picker';
import { baseUri } from "../../env";

export default function UploadForm({ navigation, route }) {
    //const [image, setImage] = useState({});
    //const [uploadedImage, setUploadedImage] = useState([]);
    const [writing, setWriting] = useState(true);
    let image = {};
    let uploadedImage = [];
    const titleInput = useInput("");
    const _contentInput = contentInput("");
    const GetToken = async () => {
        const token = await AsyncStorage.getItem("jwt");
        return token;
    };
    const PreLoad = async () => {
        if (!route.params) {
            return;
        }
    }
    const UploadPost = async () => {
        const { value: title } = titleInput;
        const { value: content } = _contentInput;
        const token = await GetToken();
        console.log(uploadedImage);
        console.log(title, content);
        if (title !== "" && content !== "") {
            await axios.post(`${baseUri.outter_net}/api/v1/post`, {
                "title": title,
                "content": content,
                "medias": uploadedImage,
            }, {
                headers: {
                    'authentication': token
                }
            })
                .then(res => {
                    console.log(res.data);
                })
                .catch(e => {
                    console.log(e);
                })
            titleInput.onChangeText("");
            _contentInput.onChangeText("");
            navigation.navigate("Home");
            Keyboard.dismiss();
            Alert.alert("게시글 작성에 성공하였습니다.");
        } else {
            console.log(title, content);
            Keyboard.dismiss();
            Alert.alert("내용을 확인해주세요.");
        }
    }
    const pickImage = async () => {
        setWriting(false);
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.cancelled) {
            //setImage(result);
            image = result;
            console.log(result.uri.split('.')[1]);
        }
        Alert.alert(
            '업로드하시겠습니까?',
            '',
            [
                {
                    text: '예',
                    onPress: () => uploadImage(),
                },
                {
                    test: '아니오',
                    onPress: () => null,
                }
            ],
        );
    };

    const uploadImage = async () => {
        const token = await GetToken();
        const media = new FormData();
        media.append('media', {
            uri: image.uri,
            type: ['image/jpeg', 'video/mp4'],
            name: ['photo.jpg', 'video.mp4'],
        });
        const config = { headers: { 
            'Content-Type': 'multipart/form-data',
            'authentication': token,  
        } };
        await axios
            .post(`${baseUri.outter_net}/api/v1/media`, media, config)
            .then(res => {
                console.log(res.data);
                Alert.alert('이미지 업로드에 성공했습니다.');
                //setUploadedImage([res.data.uid]);
                uploadedImage.push(res.data.uid);
                console.log(uploadedImage);
            })
            .catch(err => console.log(err.response));
        /*
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('media', {
            uri: image.uri,
            type: 'image/jpeg',
            name: 'photo.jpg',
        });
        xhr.responseType = 'json';
        xhr.open('POST', `${baseUri.outter_net}/api/v1/media`);
        xhr.setRequestHeader('authentication', token);
        xhr.send(formData);
        xhr.addEventListener("progress", updateProgress);
        xhr.addEventListener("load", transferComplete);
        xhr.addEventListener("error", transferFailed);
        // progress on transfers from the server to the client (downloads)
        function updateProgress(oEvent) {
            if (oEvent.lengthComputable) {
                return <Text>Loading</Text>
                // ...
            } else {
                // Unable to compute progress information since the total size is unknown
            }
        }

        function transferComplete(evt) {
            setUploadedImage([...uploadImage, xhr.response.uid]);
            console.log(xhr.response);
            console.log("The transfer is complete.");
        }

        function transferFailed(evt) {
            console.log("An error occurred while transferring the file.");
        }
        */
    }
    const HeaderRight = () => (
        <TouchableOpacity onPress={() => UploadPost()}>
            <Text style={FontStyle.HeaderRightText}>Next</Text>
        </TouchableOpacity>
    );
    useEffect(() => {
        navigation.setOptions({
            headerRight: HeaderRight,
        });
        (async () => {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    alert('Sorry, we need camera roll permissions to make this work!');
                }
            }
        })();
        PreLoad();
        console.log(image, uploadedImage);
    }, [writing]);
    return (
        <View style={Style.Container}>
            <View style={Style.Header}>
                <TextInput
                    {...titleInput}
                    style={Style.Input}
                    placeholder={'제목'}
                    returnKeyType="next"
                />
            </View>
            <View style={Style.Body}>
                <TextInput
                    {..._contentInput}
                    style={Style.Content}
                    placeholder={'내용'}
                    returnKeyType="done"
                    multiline={true}
                    autoCorrect={false}
                />
            </View>
            <View style={Style.Bottom}>
                <TouchableOpacity style={Style.Button} onPress={() => pickImage()}>
                    <Text>UploadImage</Text>
                </TouchableOpacity>
                <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={true}
                    onMomentumScrollEnd={
                        () => { console.log('Scrolling is End') }
                    }
                >
                    {/*image?.map(m => {
                        return (
                            <TouchableOpacity onPress={() => {
                                console.log(image.indexOf(m));
                            }}>
                                
                            </TouchableOpacity>
                        )
                    })*/}
                </ScrollView>
            </View>
        </View>
    );
}

const Style = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    Header: {
        width: '100%',
        height: '10%',
        marginTop: 0,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    Body: {
        height: '30%',
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    Bottom: {
        width: '100%',
        height: '45%',
        marginBottom: 0,
        backgroundColor: '#f0f0f0',
    },
    Input: {
        width: 340,
        height: 40,
        backgroundColor: '#ffffff',
        paddingLeft: 10,
    },
    Content: {
        width: 340,
        height: 200,
        backgroundColor: '#ffffff',
        paddingLeft: 10,
        textAlignVertical: 'top',
        flexShrink: 1,
        textAlign: "left",
        textAlignVertical: "top"
    },
    Photo: {
        width: 150,
        height: 150,
    },
    HeaderRightText: {
        color: 'blue',
        fontSize: 16,
        marginRight: 7,
    },
    Button: {
        width: '100%',
        height: 50,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    }
})

const FontStyle = StyleSheet.create({
    HeaderRightText: {
        color: 'blue',
        fontSize: 16,
        marginRight: 7,
    }
})
