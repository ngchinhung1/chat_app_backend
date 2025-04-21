# 🧑‍💻 Developer Onboarding Guide: Add Contact + Conversation Creation (REST + WebSocket)

## ⚙️ Overview

This service follows a **hybrid approach**:
- **REST API** for contact creation
- **WebSocket** for real-time conversation setup

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
   |<-- [2] Response: contact data
   |
   |-- [3] Emit "create_conversation" via WebSocket
   |       - toCountryCode
   |       - toPhoneNumber
   |       - conversationType: 'private' | 'group'
   |
   |<-- [4] ACK: conversationId
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
    "customer_id": "100001"
  },
  "msg": "Contact added successfully"
}
```

> Once you receive a successful response, use the returned contact info to initiate a conversation.

---

## 📡 WebSocket: Create Conversation

### **Connect**
```ts
const socket = io("http://localhost:3000", {
  extraHeaders: {
    Authorization: `Bearer ${token}`
  }
});
```

### **Emit `create_conversation`**
```ts
socket.emitWithAck(
  'create_conversation',
  {
    toCountryCode: countryCode,
    toPhoneNumber: phoneNumber,
    conversationType: conversationType, // 'private' or 'group'
  },
  (ack) => {
    if (ack && ack.status === true) {
      const conversationId = ack.conversationId;
      // Proceed with conversationId
    } else {
      // Handle error
    }
  }
);
```

### **ACK Response**
```json
{
  "status": true,
  "conversationId": "chat_uuid",
  "msg": "Conversation created successfully"
}
```

> Frontend should await this ACK to obtain the `conversationId` before navigating into the chat screen.

---

## 📝 Notes

- `conversationId` is created based on existing or new Chat records.
- Server logic ensures no duplicate conversations for the same participant pair.
- `conversationType` supports future group chat flows.
- If the contact is not yet registered in the system, you may receive `status: false` with an appropriate message.

---