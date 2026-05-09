import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Image, Pressable, Text, TextInput, View } from "react-native";

type RequestFileKind = "image" | "pdf";

type RequestAttachment = {
  id: string;
  kind: RequestFileKind | null;
  name: string;
  size?: number;
  uri: string;
};

type RequestTabProps = {
  formatBytes: (value?: number) => string;
  handleSelectRequestLocation: (option: string) => Promise<void> | void;
  isLocationOpen: boolean;
  isRequestTypeOpen: boolean;
  locationPlaceholder: string;
  onRemoveRequestAttachment: (attachmentId: string) => void;
  onSelectRequestFiles: () => void;
  onSetRequestDetails: (value: string) => void;
  onSetRequestType: (value: string) => void;
  onSubmitRequest: () => void;
  onToggleLocationOpen: () => void;
  onToggleRequestTypeOpen: () => void;
  requestAttachmentError: string;
  requestAttachments: RequestAttachment[];
  requestDetails: string;
  requestLocationOptions: readonly string[];
  requestType: string;
  requestTypeOptions: readonly string[];
  requestTypePlaceholder: string;
  selectedRequestLocationOption: string;
  styles: Record<string, any>;
  submittingRequest: boolean;
};

export default function RequestTab({
  formatBytes,
  handleSelectRequestLocation,
  isLocationOpen,
  isRequestTypeOpen,
  locationPlaceholder,
  onRemoveRequestAttachment,
  onSelectRequestFiles,
  onSetRequestDetails,
  onSetRequestType,
  onSubmitRequest,
  onToggleLocationOpen,
  onToggleRequestTypeOpen,
  requestAttachmentError,
  requestAttachments,
  requestDetails,
  requestLocationOptions,
  requestType,
  requestTypeOptions,
  requestTypePlaceholder,
  selectedRequestLocationOption,
  styles,
  submittingRequest,
}: RequestTabProps) {
  return (
    <>
      <Text style={styles.requestLeadTitle}>Шинэ хүсэлт илгээх</Text>

      <View style={styles.requestFormCard}>
        <View
          style={[
            styles.formField,
            isRequestTypeOpen ? styles.formFieldDropdownOpen : undefined,
          ]}
        >
          <Text style={styles.formLabel}>Хүсэлтийн төрөл / Гарчиг</Text>
          <View style={styles.selectWrap}>
            <Pressable style={styles.selectInput} onPress={onToggleRequestTypeOpen}>
              <Text style={styles.selectText}>{requestType || requestTypePlaceholder}</Text>
              <Feather
                color="#5A6160"
                name={isRequestTypeOpen ? "chevron-up" : "chevron-down"}
                size={22}
              />
            </Pressable>
            {isRequestTypeOpen ? (
              <View style={styles.selectOptions}>
                {requestTypeOptions.map((option, index) => (
                  <Pressable
                    key={option}
                    style={[
                      styles.selectOption,
                      index < requestTypeOptions.length - 1
                        ? styles.selectOptionBorder
                        : undefined,
                    ]}
                    onPress={() => onSetRequestType(option)}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        requestType === option ? styles.selectOptionTextActive : undefined,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        <View
          style={[styles.formField, isLocationOpen ? styles.formFieldDropdownOpen : undefined]}
        >
          <Text style={styles.formLabel}>Хаяг / Байршил</Text>
          <View style={styles.selectWrap}>
            <Pressable style={styles.selectInput} onPress={onToggleLocationOpen}>
              <Text style={styles.selectText}>
                {selectedRequestLocationOption || locationPlaceholder}
              </Text>
              <Feather
                color="#5A6160"
                name={isLocationOpen ? "chevron-up" : "chevron-down"}
                size={22}
              />
            </Pressable>
            {isLocationOpen ? (
              <View style={styles.selectOptions}>
                {requestLocationOptions.map((option, index) => (
                  <Pressable
                    key={option}
                    style={[
                      styles.selectOption,
                      index < requestLocationOptions.length - 1
                        ? styles.selectOptionBorder
                        : undefined,
                    ]}
                    onPress={() => {
                      void handleSelectRequestLocation(option);
                    }}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        selectedRequestLocationOption === option
                          ? styles.selectOptionTextActive
                          : undefined,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.formField}>
          <Text style={styles.formLabel}>Дэлгэрэнгүй мэдээлэл</Text>
          <TextInput
            multiline
            placeholder={
              "Таны асуудал эсвэл санал юу вэ?\nДэлгэрэнгүй бичнэ үү..."
            }
            placeholderTextColor="#AFB8AD"
            style={[styles.formInput, styles.formTextarea]}
            textAlignVertical="top"
            onChangeText={onSetRequestDetails}
            value={requestDetails}
          />
        </View>

        <View style={styles.formField}>
          <Text style={styles.formLabel}>Хавсралт файлууд (Зураг, Баримт)</Text>
          <View style={styles.uploadArea}>
            <Pressable onPress={onSelectRequestFiles} style={styles.uploadTapArea}>
              <MaterialCommunityIcons color="#056B1E" name="cloud-upload-outline" size={40} />
              <Text style={styles.uploadLead}>
                {"\u0424\u0430\u0439\u043b \u0447\u0438\u0440\u0447 \u043e\u0440\u0443\u0443\u043b\u043d\u0430 \u0443\u0443, \u044d\u0441\u0432\u044d\u043b"}
              </Text>
              <Text style={styles.uploadAction}>{"\u0421\u041e\u041d\u0413\u041e\u0425"}</Text>
              <Text style={styles.uploadFormats}>{"PNG, JPG, PDF (\u041c\u0430\u043a\u0441 10\u041c\u0431)"}</Text>
            </Pressable>

            {requestAttachments.length > 0 ? (
              <View style={styles.uploadList}>
                {requestAttachments.map((attachment) => {
                  const isImage = attachment.kind === "image";
                  const iconName =
                    attachment.kind === "pdf" ? "file-pdf-box" : "file-document-outline";

                  return (
                    <View key={attachment.id} style={styles.uploadItemRow}>
                      {isImage ? (
                        <Image source={{ uri: attachment.uri }} style={styles.uploadImageThumb} />
                      ) : (
                        <View style={styles.uploadDocIconWrap}>
                          <MaterialCommunityIcons color="#2B5A2D" name={iconName} size={22} />
                        </View>
                      )}

                      <View style={styles.uploadMeta}>
                        <Text numberOfLines={1} style={styles.uploadFileName}>
                          {attachment.name}
                        </Text>
                        <Text style={styles.uploadFileSize}>{formatBytes(attachment.size)}</Text>
                      </View>

                      <Pressable
                        hitSlop={8}
                        onPress={() => onRemoveRequestAttachment(attachment.id)}
                        style={styles.uploadRemoveButton}
                      >
                        <Feather color="#9B1111" name="x" size={18} />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>

          {requestAttachmentError ? (
            <Text style={styles.uploadErrorText}>{requestAttachmentError}</Text>
          ) : null}
        </View>
        <Pressable
          style={[
            styles.submitButton,
            submittingRequest ? styles.submitButtonDisabled : undefined,
          ]}
          onPress={onSubmitRequest}
          disabled={submittingRequest}
        >
          {submittingRequest ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialCommunityIcons color="#FFFFFF" name="send-outline" size={24} />
              <Text style={styles.submitButtonText}>Хүсэлт илгээх</Text>
            </>
          )}
        </Pressable>
      </View>
    </>
  );
}

