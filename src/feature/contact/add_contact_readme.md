
# 🧑‍💻 Developer Onboarding Guide: Add Contact + Chat (REST + WebSocket)

## ⚙️ Overview

This project uses a **hybrid approach**:
- `REST API` for data operations (contact creation, chat generation)
- `WebSocket` for real-time events (room joining, messaging)

---

## 🧭 Flow Diagram

```text
Client (App)
   |
   |-- [1] POST /contact/add
   |       - first_name
   |       - last_name
   |       - phone_number
   |       - country_code
   |
   |<-- [2] Response: contact + chatId
   |
   |-- [3] Emit "join_room" via WebSocket
           - chatId
           - type: 'private' | 'group'
```

---

## 🛠️ REST API: Add Contact

### **Endpoint**
```
POST /contact/add
```

### **Headers**
```http
Authorization: Bearer <JWT>
Content-Type: application/json
```

### **Body**
```json
{
  "first_name": "Ali",
  "last_name": "Bin Abu",
  "phone_number": "123456789",
  "country_code": "60"
}
```

### **Response**
```json
{
  "status": true,
  "code": 201,
  "data": {
    "id": "contact_uuid",
    "first_name": "Ali",
    "last_name": "Bin Abu",
    "phone_number": "123456789",
    "country_code": "60",
    "customer_id": "100001",
    "chatId": "chat_uuid"
  },
  "msg": "Contact added successfully"
}
```

---

## 📡 WebSocket: Join Room

### **Connect**
```ts
const socket = io("http://localhost:3000", {
  extraHeaders: {
    Authorization: `Bearer ${token}`
  }
});
```

### **Emit `join_room`**
```json
{
  "event": "join_room",
  "data": {
    "chatId": "chat_uuid",
    "type": "private"
  }
}
```

### **Server Response**
```json
{
  "event": "joined_room",
  "data": {
    "chatId": "chat_uuid",
    "type": "private",
    "message": "Successfully joined private chat room."
  }
}
```

---

## 🧠 Notes

- `chatId` is dynamically generated or reused from the `ChatListEntity`.
- `join_room` logic prevents re-joining the same chat.
- `type` should be `private` or `group` (to handle future group chat logic).
- If contact is not a registered user, `chatId` will be `null`.

---

## 📝 Future Enhancements

- [ ] Emit `user_joined` to group members
- [ ] Add `add_contact` socket support (optional)
- [ ] Display list of recent chats after `join_room`
