//
//  Copyright 2026 Picovoice Inc.
//  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
//  file accompanying this source.
//  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
//  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
//  specific language governing permissions and limitations under the License.
//

import SwiftUI

struct ContentView: View {
    @StateObject var viewModel = ViewModel()
    @State private var text = ""
    @State private var isTextFocused = false

    let activeBlue = Color(red: 55 / 255, green: 125 / 255, blue: 1, opacity: 1)
    let dangerRed = Color(red: 1, green: 14 / 255, blue: 14 / 255, opacity: 1)
    let lightGray = Color(red: 247 / 255, green: 247 / 255, blue: 247 / 255, opacity: 1)
    let backgroundGrey = Color(red: 118/255, green: 131/255, blue: 142/255, opacity: 0.1)

    var body: some View {
        let interactionDisabled =
        viewModel.state == .ERROR || viewModel.state == .TRANSLATING || viewModel.state == .INIT;
        let buttonDisabled = interactionDisabled || text.isEmpty

        GeometryReader { _ in
            VStack(spacing: 10) {
                translationBox
                
                Spacer()
                
                textBox
                
                Spacer()

                Button(
                    action: {
                        viewModel.translate(text: text)
                        hideKeyboard()
                    },
                    label: {
                        Text(viewModel.state == .TRANSLATING ? "TRANSLATING" : "TRANSLATE")
                        .padding()
                        .frame(minWidth: 240)
                        .background(buttonDisabled ? Color.gray : activeBlue)
                        .foregroundColor(Color.white)
                        .font(.title)
                    }
                ) 
                .disabled(buttonDisabled)
            }
            .onReceive(
                NotificationCenter.default.publisher(
                    for: UIApplication.willEnterForegroundNotification),
                perform: { _ in
                    viewModel.initialize()
                }
            )
            .onReceive(
                NotificationCenter.default.publisher(
                    for: UIApplication.didEnterBackgroundNotification),
                perform: { _ in
                    viewModel.destroy()
                }
            )
            .padding()
            .frame(minWidth: 0, maxWidth: .infinity, minHeight: 0)
            .background(Color.white)
            .onTapGesture {
                hideKeyboard()
            }
        }
    }
    
    var translationBox: some View {
        GeometryReader { geometry in
            VStack {
                ScrollView {
                    ZStack(alignment: .topLeading) {
                        if viewModel.errorMessage.isEmpty {
                            Text(viewModel.translation)
                                .transparentScrolling()
                                .padding(24)
                                .frame(minWidth: 0,
                                       maxWidth: .infinity,
                                       minHeight: geometry.size.height,
                                       maxHeight: .infinity,
                                       alignment: .topLeading)
                                .background(backgroundGrey)
                                .foregroundColor(Color.black)
                                .font(.title3)
                        } else {
                            Text(viewModel.errorMessage)
                                .transparentScrolling()
                                .padding(24)
                                .frame(minWidth: 0,
                                       maxWidth: .infinity,
                                       minHeight: geometry.size.height,
                                       maxHeight: .infinity,
                                       alignment: .topLeading)
                                .background(dangerRed)
                                .foregroundColor(Color.white)
                                .font(.title3)
                        }
                    }
                }
                .border(Color.gray, width: 1)
            }
        }
    }
    
    var textBox: some View {
        let interactionDisabled =
        viewModel.state == .ERROR || viewModel.state == .TRANSLATING || viewModel.state == .INIT;
        let buttonDisabled = interactionDisabled || text.isEmpty
        
        return VStack {
            GeometryReader { geometry in
                ScrollView {
                    ZStack(alignment: .topLeading) {
                        TextEditor(text: $text)
                            .transparentScrolling()
                            .padding()
                            .frame(minWidth: 0,
                                   maxWidth: .infinity,
                                   minHeight: geometry.size.height,
                                   maxHeight: .infinity)
                            .foregroundColor(Color.black)
                            .font(.title3)
                            .onChange(of: text) { _ in
                                text = String(text.prefix(Int(exactly: viewModel.maxCharacterLimit)!))
                            }
                            .disabled(interactionDisabled)
                        
                        if text.count == 0 {
                            Text("Enter any text to translate")
                                .padding(24)
                                .foregroundColor(Color.gray)
                                .font(.title3)
                        }
                    }
                }
            }
            .border(Color.gray, width: 1)
            
            HStack(alignment: .top) {
                Text("\(text.count) / \(viewModel.maxCharacterLimit)")
                    .font(.footnote)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .foregroundColor(Color.gray)
                
                Button(
                    action: {
                        text = ""
                    },
                    label: {
                        Text("CLEAR")
                            .padding(8)
                            .background(buttonDisabled ? Color.gray : activeBlue)
                            .foregroundColor(Color.white)
                            .fontWeight(.medium)
                    }
                )
                .frame(alignment: .trailing)
            }
        }
    }
}

public extension View {
    func transparentScrolling() -> some View {
        if #available(iOS 16.0, *) {
            return scrollContentBackground(.hidden)
        } else {
            return onAppear {
                UITextView.appearance().backgroundColor = .clear
            }
        }
    }

    func hideKeyboard() {
        let resign = #selector(UIResponder.resignFirstResponder)
        UIApplication.shared.sendAction(resign, to: nil, from: nil, for: nil)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
